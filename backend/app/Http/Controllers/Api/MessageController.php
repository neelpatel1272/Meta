<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index($conversationId): JsonResponse
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send message from active conversation in Inbox.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string',
        ]);

        $conversation = Conversation::with(['phoneNumber', 'contact'])->findOrFail($validated['conversation_id']);

        $phoneNumber = $conversation->phoneNumber;
        if (!$phoneNumber) {
            $phoneNumber = WhatsAppPhoneNumber::where('whats_app_account_id', $conversation->whats_app_account_id)->first();
        }

        if (!$phoneNumber) {
            return response()->json([
                'success' => false,
                'message' => 'No active WhatsApp phone number found for this account.',
            ], 422);
        }

        $message = $this->whatsAppService->sendMessage(
            $phoneNumber,
            $conversation->contact,
            $validated['content']
        );

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
            'data' => $message,
        ], 201);
    }

    /**
     * Single Send: Direct send to any number (Quick Send).
     */
    public function singleSend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whats_app_phone_number_id' => 'nullable|exists:whats_app_phone_numbers,id',
            'phone_number' => 'required|string',
            'content' => 'nullable|string',
            'template_id' => 'nullable|exists:templates,id',
            'variables' => 'nullable|array',
        ]);

        $phone = WhatsAppPhoneNumber::find($validated['whats_app_phone_number_id'] ?? null)
            ?: WhatsAppPhoneNumber::first();

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Please connect a WhatsApp phone number first.',
            ], 422);
        }

        $cleanNumber = preg_replace('/[^0-9]/', '', $validated['phone_number']);

        // Find or create contact
        $contact = Contact::firstOrCreate(
            [
                'whats_app_account_id' => $phone->whats_app_account_id,
                'phone_number' => $cleanNumber,
            ],
            [
                'first_name' => 'Recipient ' . substr($cleanNumber, -4),
                'status' => 'active',
            ]
        );

        if (!empty($validated['template_id'])) {
            $template = Template::findOrFail($validated['template_id']);
            $msg = $this->whatsAppService->sendTemplate($phone, $contact, $template, $validated['variables'] ?? []);
        } else {
            if (empty($validated['content'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message content is required when not sending a template.',
                ], 422);
            }
            $msg = $this->whatsAppService->sendMessage($phone, $contact, $validated['content']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message dispatched.',
            'data' => $msg,
        ], 201);
    }
}
