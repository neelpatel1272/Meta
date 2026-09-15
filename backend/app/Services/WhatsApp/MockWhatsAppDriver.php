<?php

namespace App\Services\WhatsApp;

use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use Illuminate\Support\Str;

class MockWhatsAppDriver implements WhatsAppDriverInterface
{
    public function sendTextMessage(WhatsAppPhoneNumber $phoneNumber, string $to, string $text): array
    {
        $mockId = 'wamid.HBgM' . Str::random(24) . '==';

        return [
            'success' => true,
            'driver' => 'mock',
            'message_id' => $mockId,
            'recipient_id' => $to,
            'status' => 'sent',
            'response' => [
                'messaging_product' => 'whatsapp',
                'contacts' => [
                    ['input' => $to, 'wa_id' => preg_replace('/[^0-9]/', '', $to)]
                ],
                'messages' => [
                    ['id' => $mockId]
                ]
            ]
        ];
    }

    public function sendTemplateMessage(WhatsAppPhoneNumber $phoneNumber, string $to, Template $template, array $variables = []): array
    {
        $mockId = 'wamid.HBgM' . Str::random(24) . '==';

        return [
            'success' => true,
            'driver' => 'mock',
            'message_id' => $mockId,
            'recipient_id' => $to,
            'template' => $template->name,
            'status' => 'sent',
            'response' => [
                'messaging_product' => 'whatsapp',
                'contacts' => [
                    ['input' => $to, 'wa_id' => preg_replace('/[^0-9]/', '', $to)]
                ],
                'messages' => [
                    ['id' => $mockId]
                ]
            ]
        ];
    }

    public function syncTemplates(WhatsAppAccount $account): array
    {
        return [
            'success' => true,
            'driver' => 'mock',
            'data' => [
                [
                    'id' => 'tpl_' . Str::random(12),
                    'name' => 'welcome_offer',
                    'category' => 'MARKETING',
                    'language' => 'en_US',
                    'status' => 'APPROVED',
                    'components' => [
                        ['type' => 'HEADER', 'format' => 'TEXT', 'text' => 'Welcome to our Service!'],
                        ['type' => 'BODY', 'text' => 'Hi {{1}}, thank you for joining! Enjoy {{2}} off on your next purchase.'],
                        ['type' => 'FOOTER', 'text' => 'Reply STOP to unsubscribe.'],
                    ]
                ],
                [
                    'id' => 'tpl_' . Str::random(12),
                    'name' => 'order_confirmation',
                    'category' => 'UTILITY',
                    'language' => 'en_US',
                    'status' => 'APPROVED',
                    'components' => [
                        ['type' => 'BODY', 'text' => 'Hello {{1}}, your order #{{2}} of ₹{{3}} has been confirmed.'],
                    ]
                ]
            ]
        ];
    }

    public function fetchPhoneNumbers(WhatsAppAccount $account): array
    {
        return [
            'success' => true,
            'driver' => 'mock',
            'data' => [
                [
                    'id' => '108291827461982',
                    'display_phone_number' => '+91 98765 43210',
                    'verified_name' => 'Official Business',
                    'quality_rating' => 'GREEN',
                    'code_verification_status' => 'VERIFIED',
                ]
            ]
        ];
    }

    public function subscribeApp(WhatsAppAccount $account): array
    {
        return [
            'success' => true,
            'driver' => 'mock',
            'message' => 'Subscribed to WhatsApp webhooks successfully.'
        ];
    }
}
