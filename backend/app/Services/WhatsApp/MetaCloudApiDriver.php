<?php

namespace App\Services\WhatsApp;

use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCloudApiDriver implements WhatsAppDriverInterface
{
    protected string $graphApiUrl;

    public function __construct()
    {
        $version = config('services.meta.api_version', 'v21.0');
        $this->graphApiUrl = "https://graph.facebook.com/{$version}";
    }

    public function sendTextMessage(WhatsAppPhoneNumber $phoneNumber, string $to, string $text): array
    {
        $account = $phoneNumber->whatsAppAccount;
        $cleanPhone = preg_replace('/[^0-9]/', '', $to);

        $response = Http::withToken($account->access_token)
            ->post("{$this->graphApiUrl}/{$phoneNumber->phone_number_id}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $cleanPhone,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $text,
                ],
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $wamid = $data['messages'][0]['id'] ?? null;
            return [
                'success' => true,
                'driver' => 'meta',
                'message_id' => $wamid,
                'response' => $data,
            ];
        }

        Log::error('Meta Cloud API Send Error: ' . $response->body());
        return [
            'success' => false,
            'driver' => 'meta',
            'error' => $response->json()['error']['message'] ?? $response->body(),
            'status_code' => $response->status(),
        ];
    }

    public function sendTemplateMessage(WhatsAppPhoneNumber $phoneNumber, string $to, Template $template, array $variables = []): array
    {
        $account = $phoneNumber->whatsAppAccount;
        $cleanPhone = preg_replace('/[^0-9]/', '', $to);

        $parameters = [];
        foreach ($variables as $val) {
            $parameters[] = [
                'type' => 'text',
                'text' => (string)$val,
            ];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $cleanPhone,
            'type' => 'template',
            'template' => [
                'name' => $template->name,
                'language' => [
                    'code' => $template->language ?: 'en_US',
                ],
            ],
        ];

        if (!empty($parameters)) {
            $payload['template']['components'] = [
                [
                    'type' => 'body',
                    'parameters' => $parameters,
                ]
            ];
        }

        $response = Http::withToken($account->access_token)
            ->post("{$this->graphApiUrl}/{$phoneNumber->phone_number_id}/messages", $payload);

        if ($response->successful()) {
            $data = $response->json();
            $wamid = $data['messages'][0]['id'] ?? null;
            return [
                'success' => true,
                'driver' => 'meta',
                'message_id' => $wamid,
                'response' => $data,
            ];
        }

        Log::error('Meta Cloud API Send Template Error: ' . $response->body());
        return [
            'success' => false,
            'driver' => 'meta',
            'error' => $response->json()['error']['message'] ?? $response->body(),
            'status_code' => $response->status(),
        ];
    }

    public function syncTemplates(WhatsAppAccount $account): array
    {
        $response = Http::withToken($account->access_token)
            ->get("{$this->graphApiUrl}/{$account->waba_id}/message_templates");

        if ($response->successful()) {
            return [
                'success' => true,
                'driver' => 'meta',
                'data' => $response->json()['data'] ?? [],
            ];
        }

        return [
            'success' => false,
            'driver' => 'meta',
            'error' => $response->json()['error']['message'] ?? $response->body(),
        ];
    }

    public function fetchPhoneNumbers(WhatsAppAccount $account): array
    {
        $response = Http::withToken($account->access_token)
            ->get("{$this->graphApiUrl}/{$account->waba_id}/phone_numbers");

        if ($response->successful()) {
            return [
                'success' => true,
                'driver' => 'meta',
                'data' => $response->json()['data'] ?? [],
            ];
        }

        return [
            'success' => false,
            'driver' => 'meta',
            'error' => $response->json()['error']['message'] ?? $response->body(),
        ];
    }

    public function subscribeApp(WhatsAppAccount $account): array
    {
        $response = Http::withToken($account->access_token)
            ->post("{$this->graphApiUrl}/{$account->waba_id}/subscribed_apps");

        return [
            'success' => $response->successful(),
            'driver' => 'meta',
            'data' => $response->json(),
        ];
    }
}
