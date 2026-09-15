<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Template;
use App\Models\User;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WhatsAppDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::create([
            'name' => 'Demo Admin',
            'email' => 'admin@themesbrand.com',
            'password' => Hash::make('12345678'),
            'avatar' => 'avatar-1.jpg',
        ]);

        // 1. WhatsApp Account
        $account = WhatsAppAccount::updateOrCreate(
            ['user_id' => $user->id, 'waba_id' => '109283746592817'],
            [
                'name' => 'Nexus Retail WhatsApp',
                'business_id' => 'bm_882910482910',
                'status' => 'connected',
                'access_token' => 'EAA...demo_encrypted_token',
                'meta_app_id' => 'app_991827364',
            ]
        );

        // 2. WhatsApp Phone Number
        $phone = WhatsAppPhoneNumber::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'phone_number_id' => '108291827461982',
            ],
            [
                'phone_number' => '+91 98765 43210',
                'display_name' => 'Nexus Retail Support',
                'verified_name' => 'Nexus Retail Store',
                'quality_rating' => 'GREEN',
                'code_verification_status' => 'VERIFIED',
                'status' => 'active',
            ]
        );

        // 3. Templates
        $template1 = Template::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'name' => 'welcome_onboarding',
                'language' => 'en_US',
            ],
            [
                'meta_template_id' => 'meta_tpl_001',
                'category' => 'MARKETING',
                'status' => 'APPROVED',
                'header_type' => 'TEXT',
                'header_content' => 'Welcome to Nexus!',
                'body_text' => 'Hi {{1}}, thank you for contacting Nexus Retail. We are delighted to assist you today! How can we help?',
                'footer_text' => 'Reply STOP to opt out',
                'buttons' => [
                    ['type' => 'QUICK_REPLY', 'text' => 'View Catalog'],
                    ['type' => 'QUICK_REPLY', 'text' => 'Talk to Agent'],
                ],
                'sample_variables' => ['Rahul'],
            ]
        );

        $template2 = Template::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'name' => 'order_status_update',
                'language' => 'en_US',
            ],
            [
                'meta_template_id' => 'meta_tpl_002',
                'category' => 'UTILITY',
                'status' => 'APPROVED',
                'header_type' => 'TEXT',
                'header_content' => 'Order Dispatched',
                'body_text' => 'Hello {{1}}, your order #{{2}} is on the way! Tracking code: {{3}}.',
                'footer_text' => 'Nexus Logistics',
                'buttons' => [
                    ['type' => 'URL', 'text' => 'Track Order', 'url' => 'https://example.com/track/{{1}}'],
                ],
                'sample_variables' => ['Priya', 'ORD-9821', 'TRK-55442'],
            ]
        );

        // 4. Contacts
        $contactsData = [
            [
                'first_name' => 'Rahul',
                'last_name' => 'Sharma',
                'phone_number' => '919811122233',
                'email' => 'rahul@example.com',
                'group_name' => 'VIP Customers',
                'tags' => ['retail', 'vip'],
            ],
            [
                'first_name' => 'Priya',
                'last_name' => 'Patel',
                'phone_number' => '919822233344',
                'email' => 'priya@example.com',
                'group_name' => 'E-Commerce Leads',
                'tags' => ['high-intent', 'lead'],
            ],
            [
                'first_name' => 'Amit',
                'last_name' => 'Verma',
                'phone_number' => '919833344455',
                'email' => 'amit@example.com',
                'group_name' => 'VIP Customers',
                'tags' => ['wholesale'],
            ],
            [
                'first_name' => 'Neha',
                'last_name' => 'Singh',
                'phone_number' => '919844455566',
                'email' => 'neha@example.com',
                'group_name' => 'Support',
                'tags' => ['support'],
            ],
        ];

        $contacts = [];
        foreach ($contactsData as $c) {
            $contacts[] = Contact::updateOrCreate(
                [
                    'whats_app_account_id' => $account->id,
                    'phone_number' => $c['phone_number'],
                ],
                array_merge($c, [
                    'whats_app_account_id' => $account->id,
                    'status' => 'active',
                ])
            );
        }

        // 5. Conversations & Messages for Rahul
        $conv1 = Conversation::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'contact_id' => $contacts[0]->id,
            ],
            [
                'whats_app_phone_number_id' => $phone->id,
                'status' => 'open',
                'last_message' => 'Thanks, what is the estimated delivery time?',
                'last_message_at' => now()->subMinutes(5),
                'unread_count' => 1,
            ]
        );

        Message::create([
            'conversation_id' => $conv1->id,
            'whats_app_account_id' => $account->id,
            'contact_id' => $contacts[0]->id,
            'message_id' => 'wamid.HBgM' . Str::random(20),
            'direction' => 'inbound',
            'type' => 'text',
            'content' => 'Hello! Is this Nexus Retail?',
            'status' => 'delivered',
            'created_at' => now()->subMinutes(20),
        ]);

        Message::create([
            'conversation_id' => $conv1->id,
            'whats_app_account_id' => $account->id,
            'contact_id' => $contacts[0]->id,
            'message_id' => 'wamid.HBgM' . Str::random(20),
            'direction' => 'outbound',
            'type' => 'text',
            'content' => 'Hi Rahul! Yes, this is Nexus Retail official support. How can we help you today?',
            'status' => 'read',
            'created_at' => now()->subMinutes(18),
        ]);

        Message::create([
            'conversation_id' => $conv1->id,
            'whats_app_account_id' => $account->id,
            'contact_id' => $contacts[0]->id,
            'message_id' => 'wamid.HBgM' . Str::random(20),
            'direction' => 'inbound',
            'type' => 'text',
            'content' => 'Thanks, what is the estimated delivery time?',
            'status' => 'delivered',
            'created_at' => now()->subMinutes(5),
        ]);

        // 6. Conversations & Messages for Priya
        $conv2 = Conversation::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'contact_id' => $contacts[1]->id,
            ],
            [
                'whats_app_phone_number_id' => $phone->id,
                'status' => 'resolved',
                'last_message' => 'Your order #ORD-9821 is confirmed! Thank you.',
                'last_message_at' => now()->subHours(2),
                'unread_count' => 0,
            ]
        );

        Message::create([
            'conversation_id' => $conv2->id,
            'whats_app_account_id' => $account->id,
            'contact_id' => $contacts[1]->id,
            'message_id' => 'wamid.HBgM' . Str::random(20),
            'direction' => 'outbound',
            'type' => 'text',
            'content' => 'Your order #ORD-9821 is confirmed! Thank you.',
            'status' => 'read',
            'created_at' => now()->subHours(2),
        ]);

        // 7. Campaign
        $campaign = Campaign::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'name' => 'Spring Festival Mega Broadcast',
            ],
            [
                'whats_app_phone_number_id' => $phone->id,
                'template_id' => $template1->id,
                'status' => 'completed',
                'scheduled_at' => now()->subDay(),
                'total_recipients' => 4,
                'sent_count' => 4,
                'delivered_count' => 4,
                'read_count' => 3,
                'failed_count' => 0,
            ]
        );

        foreach ($contacts as $c) {
            CampaignRecipient::updateOrCreate(
                [
                    'campaign_id' => $campaign->id,
                    'contact_id' => $c->id,
                ],
                [
                    'phone_number' => $c->phone_number,
                    'variables' => [$c->first_name],
                    'status' => 'delivered',
                    'message_id' => 'wamid.HBgM' . Str::random(20),
                    'sent_at' => now()->subDay(),
                ]
            );
        }
    }
}
