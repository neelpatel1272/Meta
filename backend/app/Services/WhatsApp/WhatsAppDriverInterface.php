<?php

namespace App\Services\WhatsApp;

use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;

interface WhatsAppDriverInterface
{
    /**
     * Send a direct text message.
     */
    public function sendTextMessage(WhatsAppPhoneNumber $phoneNumber, string $to, string $text): array;

    /**
     * Send a template message.
     */
    public function sendTemplateMessage(WhatsAppPhoneNumber $phoneNumber, string $to, Template $template, array $variables = []): array;

    /**
     * Sync templates from Meta for a WhatsApp account.
     */
    public function syncTemplates(WhatsAppAccount $account): array;

    /**
     * Fetch / sync phone numbers for a WhatsApp account.
     */
    public function fetchPhoneNumbers(WhatsAppAccount $account): array;

    /**
     * Register / subscribe app for webhooks.
     */
    public function subscribeApp(WhatsAppAccount $account): array;
}
