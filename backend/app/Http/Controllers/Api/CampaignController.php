<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use App\Models\Template;
use App\Models\WhatsAppPhoneNumber;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index(Request $request): JsonResponse
    {
        $campaigns = Campaign::with(['template', 'phoneNumber'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $campaigns,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'whats_app_phone_number_id' => 'required|exists:whats_app_phone_numbers,id',
            'template_id' => 'required|exists:templates,id',
            'name' => 'required|string|max:255',
            'scheduled_at' => 'nullable|date',
            'contact_ids' => 'nullable|array',
            'group_name' => 'nullable|string',
            'direct_numbers' => 'nullable|array',
        ]);

        $phoneNumber = WhatsAppPhoneNumber::findOrFail($validated['whats_app_phone_number_id']);
        $accountId = $phoneNumber->whats_app_account_id;

        $campaign = Campaign::create([
            'whats_app_account_id' => $accountId,
            'whats_app_phone_number_id' => $phoneNumber->id,
            'template_id' => $validated['template_id'],
            'name' => $validated['name'],
            'status' => 'draft',
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'total_recipients' => 0,
        ]);

        // Gather contacts
        $recipientsList = collect();

        if (!empty($validated['contact_ids'])) {
            $contacts = Contact::whereIn('id', $validated['contact_ids'])->get();
            foreach ($contacts as $c) {
                $recipientsList->push(['contact_id' => $c->id, 'phone_number' => $c->phone_number]);
            }
        } elseif (!empty($validated['group_name'])) {
            $contacts = Contact::where('group_name', $validated['group_name'])->get();
            foreach ($contacts as $c) {
                $recipientsList->push(['contact_id' => $c->id, 'phone_number' => $c->phone_number]);
            }
        } elseif (!empty($validated['direct_numbers'])) {
            foreach ($validated['direct_numbers'] as $num) {
                $recipientsList->push(['contact_id' => null, 'phone_number' => preg_replace('/[^0-9]/', '', $num)]);
            }
        } else {
            // Default: All active contacts of this account
            $contacts = Contact::where('whats_app_account_id', $accountId)->where('status', 'active')->get();
            foreach ($contacts as $c) {
                $recipientsList->push(['contact_id' => $c->id, 'phone_number' => $c->phone_number]);
            }
        }

        // Insert recipients
        foreach ($recipientsList as $r) {
            CampaignRecipient::create([
                'campaign_id' => $campaign->id,
                'contact_id' => $r['contact_id'],
                'phone_number' => $r['phone_number'],
                'status' => 'pending',
            ]);
        }

        $campaign->update(['total_recipients' => $recipientsList->count()]);

        return response()->json([
            'success' => true,
            'message' => 'Campaign created successfully.',
            'data' => $campaign->load('recipients'),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $campaign = Campaign::with(['template', 'phoneNumber', 'recipients'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $campaign,
        ]);
    }

    public function send($id): JsonResponse
    {
        $campaign = Campaign::with(['template', 'phoneNumber', 'recipients.contact'])->findOrFail($id);

        if ($campaign->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Campaign has already been completed.',
            ], 400);
        }

        $campaign->update(['status' => 'processing']);

        $sent = 0;
        $failed = 0;

        foreach ($campaign->recipients as $recipient) {
            if ($recipient->status === 'sent') continue;

            try {
                $contact = $recipient->contact;
                if (!$contact) {
                    $contact = Contact::firstOrCreate(
                        [
                            'whats_app_account_id' => $campaign->whats_app_account_id,
                            'phone_number' => $recipient->phone_number,
                        ],
                        ['first_name' => 'Recipient']
                    );
                }

                $msg = $this->whatsAppService->sendTemplate(
                    $campaign->phoneNumber,
                    $contact,
                    $campaign->template,
                    $recipient->variables ?? []
                );

                if ($msg->status === 'sent') {
                    $recipient->update([
                        'status' => 'sent',
                        'message_id' => $msg->message_id,
                        'sent_at' => now(),
                    ]);
                    $sent++;
                } else {
                    $recipient->update([
                        'status' => 'failed',
                        'error_message' => $msg->error_message,
                    ]);
                    $failed++;
                }
            } catch (\Throwable $e) {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        $campaign->update([
            'status' => 'completed',
            'sent_count' => $campaign->sent_count + $sent,
            'failed_count' => $campaign->failed_count + $failed,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Campaign processed: {$sent} sent, {$failed} failed.",
            'data' => $campaign->fresh(),
        ]);
    }
}
