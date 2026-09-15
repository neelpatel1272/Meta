<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use Tests\TestCase;

class WhatsAppApiTest extends TestCase
{
    public function test_can_list_whatsapp_accounts()
    {
        $response = $this->getJson('/api/whatsapp/accounts');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'waba_id', 'status']
                ]
            ]);
    }

    public function test_can_list_contacts()
    {
        $response = $this->getJson('/api/contacts');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_create_contact()
    {
        $response = $this->postJson('/api/contacts', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone_number' => '14155552671',
            'email' => 'john.doe@example.com',
            'group_name' => 'Test Group',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_can_list_conversations()
    {
        $response = $this->getJson('/api/conversations');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_send_reply_in_conversation()
    {
        $conv = Conversation::first();
        if (!$conv) {
            $this->markTestSkipped('No conversation found.');
        }

        $response = $this->postJson('/api/messages/reply', [
            'conversation_id' => $conv->id,
            'content' => 'Hello from automated unit test!',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.status', 'sent');
    }

    public function test_can_single_send_message()
    {
        $phone = WhatsAppPhoneNumber::first();
        if (!$phone) {
            $this->markTestSkipped('No phone number found.');
        }

        $response = $this->postJson('/api/messages/single-send', [
            'whats_app_phone_number_id' => $phone->id,
            'phone_number' => '919876543999',
            'content' => 'Test single send notification',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_can_fetch_analytics_overview()
    {
        $response = $this->getJson('/api/analytics/overview');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'kpis' => ['total_sent', 'total_delivered', 'total_read', 'delivery_rate'],
                    'trend',
                ]
            ]);
    }

    public function test_webhook_verification()
    {
        $response = $this->get('/api/webhook/meta?hub_mode=subscribe&hub_verify_token=whatsapp_saas_webhook_token&hub_challenge=CHALLENGE_123');
        $response->assertStatus(200)
            ->assertSeeText('CHALLENGE_123');
    }

    public function test_webhook_incoming_message_ingestion()
    {
        $phone = WhatsAppPhoneNumber::first();
        if (!$phone) {
            $this->markTestSkipped('No phone number found.');
        }

        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [
                [
                    'id' => '109283746592817',
                    'changes' => [
                        [
                            'value' => [
                                'messaging_product' => 'whatsapp',
                                'metadata' => [
                                    'display_phone_number' => '+919876543210',
                                    'phone_number_id' => $phone->phone_number_id,
                                ],
                                'contacts' => [
                                    [
                                        'profile' => ['name' => 'Alice Wonder'],
                                        'wa_id' => '919999888877',
                                    ]
                                ],
                                'messages' => [
                                    [
                                        'from' => '919999888877',
                                        'id' => 'wamid.TEST_INCOMING_001',
                                        'timestamp' => '1710400000',
                                        'type' => 'text',
                                        'text' => ['body' => 'Hi, I need pricing information!'],
                                    ]
                                ]
                            ],
                            'field' => 'messages'
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhook/meta', $payload);
        $response->assertStatus(200);

        // Verify contact and message were stored in DB
        $this->assertDatabaseHas('contacts', [
            'phone_number' => '919999888877',
        ]);

        $this->assertDatabaseHas('messages', [
            'message_id' => 'wamid.TEST_INCOMING_001',
            'direction' => 'inbound',
        ]);
    }
}
