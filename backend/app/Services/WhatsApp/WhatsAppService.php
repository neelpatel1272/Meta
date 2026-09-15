<?php

namespace App\Services\WhatsApp;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected WhatsAppDriverInterface $driver;

    public function __construct()
    {
        $driverName = config('services.whatsapp.driver', env('WHATSAPP_DRIVER', 'mock'));

        if ($driverName === 'meta') {
            $this->driver = new MetaCloudApiDriver();
        } else {
            $this->driver = new MockWhatsAppDriver();
        }
    }

    public function getDriver(): WhatsAppDriverInterface
    {
        return $this->driver;
    }

    /**
     * Send direct message and persist to database.
     */
    public function sendMessage(WhatsAppPhoneNumber $phoneNumber, Contact $contact, string $text): Message
    {
        // 1. Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'whats_app_account_id' => $phoneNumber->whats_app_account_id,
                'contact_id' => $contact->id,
            ],
            [
                'whats_app_phone_number_id' => $phoneNumber->id,
                'status' => 'open',
            ]
        );

        // 2. Call driver
        $result = $this->driver->sendTextMessage($phoneNumber, $contact->phone_number, $text);

        // 3. Create message record
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'whats_app_account_id' => $phoneNumber->whats_app_account_id,
            'contact_id' => $contact->id,
            'message_id' => $result['message_id'] ?? null,
            'direction' => 'outbound',
            'type' => 'text',
            'content' => $text,
            'status' => ($result['success'] ?? false) ? 'sent' : 'failed',
            'error_message' => $result['error'] ?? null,
        ]);

        // 4. Update conversation
        $conversation->update([
            'last_message' => $text,
            'last_message_at' => now(),
            'whats_app_phone_number_id' => $phoneNumber->id,
        ]);

        return $message;
    }

    /**
     * Send a template message to a contact.
     */
    public function sendTemplate(WhatsAppPhoneNumber $phoneNumber, Contact $contact, Template $template, array $variables = []): Message
    {
        $conversation = Conversation::firstOrCreate(
            [
                'whats_app_account_id' => $phoneNumber->whats_app_account_id,
                'contact_id' => $contact->id,
            ],
            [
                'whats_app_phone_number_id' => $phoneNumber->id,
                'status' => 'open',
            ]
        );

        $result = $this->driver->sendTemplateMessage($phoneNumber, $contact->phone_number, $template, $variables);

        $content = $template->body_text;
        foreach ($variables as $idx => $var) {
            $content = str_replace('{{' . ($idx + 1) . '}}', $var, $content);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'whats_app_account_id' => $phoneNumber->whats_app_account_id,
            'contact_id' => $contact->id,
            'message_id' => $result['message_id'] ?? null,
            'direction' => 'outbound',
            'type' => 'template',
            'content' => $content,
            'metadata' => [
                'template_id' => $template->id,
                'template_name' => $template->name,
                'variables' => $variables,
            ],
            'status' => ($result['success'] ?? false) ? 'sent' : 'failed',
            'error_message' => $result['error'] ?? null,
        ]);

        $conversation->update([
            'last_message' => "[Template: {$template->name}]",
            'last_message_at' => now(),
            'whats_app_phone_number_id' => $phoneNumber->id,
        ]);

        return $message;
    }

    /**
     * Sync templates from Meta into DB.
     */
    public function syncTemplates(WhatsAppAccount $account): array
    {
        $res = $this->driver->syncTemplates($account);
        if (!($res['success'] ?? false)) {
            return $res;
        }

        $synced = [];
        foreach ($res['data'] ?? [] as $metaTpl) {
            $body = '';
            $header = null;
            $footer = null;
            $buttons = [];

            foreach ($metaTpl['components'] ?? [] as $comp) {
                if (($comp['type'] ?? '') === 'BODY') {
                    $body = $comp['text'] ?? '';
                } elseif (($comp['type'] ?? '') === 'HEADER') {
                    $header = $comp['text'] ?? null;
                } elseif (($comp['type'] ?? '') === 'FOOTER') {
                    $footer = $comp['text'] ?? null;
                } elseif (($comp['type'] ?? '') === 'BUTTONS') {
                    $buttons = $comp['buttons'] ?? [];
                }
            }

            $template = Template::updateOrCreate(
                [
                    'whats_app_account_id' => $account->id,
                    'name' => $metaTpl['name'],
                    'language' => $metaTpl['language'] ?? 'en_US',
                ],
                [
                    'meta_template_id' => $metaTpl['id'] ?? null,
                    'category' => $metaTpl['category'] ?? 'MARKETING',
                    'status' => $metaTpl['status'] ?? 'APPROVED',
                    'header_content' => $header,
                    'body_text' => $body ?: 'Template Body',
                    'footer_text' => $footer,
                    'buttons' => $buttons,
                ]
            );
            $synced[] = $template;
        }

        return ['success' => true, 'templates' => $synced];
    }
}
