<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accountId = $request->query('whats_app_account_id');
        $status = $request->query('status');

        $query = Conversation::with(['contact', 'phoneNumber']);

        if ($accountId) {
            $query->where('whats_app_account_id', $accountId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('contact', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $conversations = $query->orderBy('last_message_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function show($id): JsonResponse
    {
        $conversation = Conversation::with(['contact', 'phoneNumber', 'messages'])->findOrFail($id);

        // Reset unread count on open
        $conversation->update(['unread_count' => 0]);

        return response()->json([
            'success' => true,
            'data' => $conversation,
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:open,resolved,pending',
        ]);

        $conversation = Conversation::findOrFail($id);
        $conversation->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Conversation marked as {$validated['status']}.",
            'data' => $conversation,
        ]);
    }
}
