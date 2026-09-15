<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppAccountController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ?: 1; // Fallback to demo user if not logged in

        $accounts = WhatsAppAccount::with('phoneNumbers')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'waba_id' => 'required|string',
            'business_id' => 'nullable|string',
            'access_token' => 'nullable|string',
            'meta_app_id' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'phone_number_id' => 'nullable|string',
            'display_name' => 'nullable|string',
        ]);

        $userId = $request->user()?->id ?: 1;

        $account = WhatsAppAccount::updateOrCreate(
            [
                'user_id' => $userId,
                'waba_id' => $validated['waba_id'],
            ],
            [
                'name' => $validated['name'],
                'business_id' => $validated['business_id'] ?? null,
                'status' => 'connected',
                'access_token' => $validated['access_token'] ?? null,
                'meta_app_id' => $validated['meta_app_id'] ?? null,
            ]
        );

        // If phone number provided, create/update it
        if (!empty($validated['phone_number_id']) && !empty($validated['phone_number'])) {
            WhatsAppPhoneNumber::updateOrCreate(
                [
                    'whats_app_account_id' => $account->id,
                    'phone_number_id' => $validated['phone_number_id'],
                ],
                [
                    'phone_number' => $validated['phone_number'],
                    'display_name' => $validated['display_name'] ?? $validated['name'],
                    'verified_name' => $validated['display_name'] ?? $validated['name'],
                    'quality_rating' => 'GREEN',
                    'status' => 'active',
                ]
            );
        }

        // Auto sync templates from mock or meta
        try {
            $this->whatsAppService->syncTemplates($account);
        } catch (\Throwable $e) {
            // Log but don't fail connection
        }

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp account connected successfully (Direct-to-Meta Model 1).',
            'data' => $account->load('phoneNumbers'),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $account = WhatsAppAccount::with(['phoneNumbers', 'templates'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $account,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $account = WhatsAppAccount::findOrFail($id);
        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp account disconnected.',
        ]);
    }
}
