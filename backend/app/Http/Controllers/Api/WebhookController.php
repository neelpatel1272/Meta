<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WebhookLog;
use App\Models\WhatsAppPhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Webhook verification (Meta handshake).
     */
    public function verify(Request $request): Response
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $verifyToken = config('services.meta.verify_token', env('META_VERIFY_TOKEN', 'whatsapp_saas_webhook_token'));

        if ($mode === 'subscribe' && $token === $verifyToken) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        return response('Forbidden', 403);
    }

    /**
     * Webhook event receiver.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->all();

        // 1. Log incoming payload
        WebhookLog::create([
            'phone_number_id' => $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] ?? null,
            'event_type' => isset($payload['entry'][0]['changes'][0]['value']['messages']) ? 'messages' : 'statuses',
            'payload' => $payload,
            'status' => 'received',
        ]);

        // 2. Parse entries
        $entries = $payload['entry'] ?? [];
        foreach ($entries as $entry) {
            $changes = $entry['changes'] ?? [];
            foreach ($changes as $change) {
                $value = $change['value'] ?? [];
                $metadata = $value['metadata'] ?? [];
                $phoneNumberId = $metadata['phone_number_id'] ?? null;

                $phone = WhatsAppPhoneNumber::where('phone_number_id', $phoneNumberId)->first();
                $accountId = $phone?->whats_app_account_id;

                // Handle Inbound Messages
                if (!empty($value['messages'])) {
                    foreach ($value['messages'] as $msg) {
                        $from = $msg['from'] ?? null;
                        $wamid = $msg['id'] ?? null;
                        $type = $msg['type'] ?? 'text';
                        $content = null;

                        if ($type === 'text') {
                            $content = $msg['text']['body'] ?? '';
                        } elseif ($type === 'interactive') {
                            $content = $msg['interactive']['button_reply']['title'] ?? ($msg['interactive']['list_reply']['title'] ?? 'Interactive Reply');
                        } else {
                            $content = "[{$type} received]";
                        }

                        if ($accountId && $from) {
                            $contact = Contact::firstOrCreate(
                                [
                                    'whats_app_account_id' => $accountId,
                                    'phone_number' => $from,
                                ],
                                [
                                    'first_name' => $value['contacts'][0]['profile']['name'] ?? 'WhatsApp User',
                                    'status' => 'active',
                                ]
                            );

                            $conversation = Conversation::firstOrCreate(
                                [
                                    'whats_app_account_id' => $accountId,
                                    'contact_id' => $contact->id,
                                ],
                                [
                                    'whats_app_phone_number_id' => $phone?->id,
                                    'status' => 'open',
                                ]
                            );

                            Message::create([
                                'conversation_id' => $conversation->id,
                                'whats_app_account_id' => $accountId,
                                'contact_id' => $contact->id,
                                'message_id' => $wamid,
                                'direction' => 'inbound',
                                'type' => $type,
                                'content' => $content,
                                'status' => 'delivered',
                            ]);

                            $conversation->update([
                                'last_message' => $content,
                                'last_message_at' => now(),
                                'unread_count' => $conversation->unread_count + 1,
                            ]);
                        }
                    }
                }

                // Handle Message Status updates (sent, delivered, read, failed)
                if (!empty($value['statuses'])) {
                    foreach ($value['statuses'] as $statusUpdate) {
                        $wamid = $statusUpdate['id'] ?? null;
                        $status = $statusUpdate['status'] ?? null;

                        if ($wamid && $status) {
                            $message = Message::where('message_id', $wamid)->first();
                            if ($message) {
                                $message->update(['status' => $status]);
                            }

                            $recipient = CampaignRecipient::where('message_id', $wamid)->first();
                            if ($recipient) {
                                $recipient->update(['status' => $status]);
                            }
                        }
                    }
                }
            }
        }

        return response('EVENT_RECEIVED', 200);
    }
}
