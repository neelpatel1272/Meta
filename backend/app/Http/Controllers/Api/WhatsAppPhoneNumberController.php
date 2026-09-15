<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppAccount;
use App\Models\WhatsAppPhoneNumber;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppPhoneNumberController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index($accountId): JsonResponse
    {
        $numbers = WhatsAppPhoneNumber::where('whats_app_account_id', $accountId)->get();

        return response()->json([
            'success' => true,
            'data' => $numbers,
        ]);
    }

    public function store(Request $request, $accountId): JsonResponse
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'phone_number' => 'required|string',
            'display_name' => 'nullable|string',
        ]);

        $account = WhatsAppAccount::findOrFail($accountId);

        $number = WhatsAppPhoneNumber::updateOrCreate(
            [
                'whats_app_account_id' => $account->id,
                'phone_number_id' => $validated['phone_number_id'],
            ],
            [
                'phone_number' => $validated['phone_number'],
                'display_name' => $validated['display_name'] ?? $validated['phone_number'],
                'verified_name' => $validated['display_name'] ?? $validated['phone_number'],
                'quality_rating' => 'GREEN',
                'status' => 'active',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Phone number registered.',
            'data' => $number,
        ], 201);
    }

    public function sync($accountId): JsonResponse
    {
        $account = WhatsAppAccount::findOrFail($accountId);
        $res = $this->whatsAppService->getDriver()->fetchPhoneNumbers($account);

        if (!($res['success'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => $res['error'] ?? 'Failed to sync phone numbers from Meta',
            ], 400);
        }

        $synced = [];
        foreach ($res['data'] ?? [] as $item) {
            $num = WhatsAppPhoneNumber::updateOrCreate(
                [
                    'whats_app_account_id' => $account->id,
                    'phone_number_id' => $item['id'],
                ],
                [
                    'phone_number' => $item['display_phone_number'] ?? '',
                    'display_name' => $item['verified_name'] ?? null,
                    'verified_name' => $item['verified_name'] ?? null,
                    'quality_rating' => $item['quality_rating'] ?? 'GREEN',
                    'code_verification_status' => $item['code_verification_status'] ?? null,
                    'status' => 'active',
                ]
            );
            $synced[] = $num;
        }

        return response()->json([
            'success' => true,
            'message' => 'Phone numbers synced from Meta Cloud API.',
            'data' => $synced,
        ]);
    }
}
