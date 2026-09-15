<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $accountId = $request->query('whats_app_account_id');

        $msgQuery = Message::query();
        $contactQuery = Contact::query();
        $convQuery = Conversation::query();
        $campQuery = Campaign::query();

        if ($accountId) {
            $msgQuery->where('whats_app_account_id', $accountId);
            $contactQuery->where('whats_app_account_id', $accountId);
            $convQuery->where('whats_app_account_id', $accountId);
            $campQuery->where('whats_app_account_id', $accountId);
        }

        $totalSent = (clone $msgQuery)->where('direction', 'outbound')->whereIn('status', ['sent', 'delivered', 'read'])->count();
        $totalDelivered = (clone $msgQuery)->where('direction', 'outbound')->whereIn('status', ['delivered', 'read'])->count();
        $totalRead = (clone $msgQuery)->where('direction', 'outbound')->where('status', 'read')->count();
        $totalFailed = (clone $msgQuery)->where('direction', 'outbound')->where('status', 'failed')->count();
        $totalInbound = (clone $msgQuery)->where('direction', 'inbound')->count();

        $deliveryRate = $totalSent > 0 ? round(($totalDelivered / $totalSent) * 100, 1) : 100;
        $readRate = $totalDelivered > 0 ? round(($totalRead / $totalDelivered) * 100, 1) : 0;

        $totalContacts = $contactQuery->count();
        $activeConversations = $convQuery->where('status', 'open')->count();
        $totalCampaigns = $campQuery->count();

        // 7-day trend
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $sentOnDay = (clone $msgQuery)->where('direction', 'outbound')->whereDate('created_at', $date)->count();
            $inboundOnDay = (clone $msgQuery)->where('direction', 'inbound')->whereDate('created_at', $date)->count();
            $trend[] = [
                'date' => $date,
                'sent' => $sentOnDay,
                'received' => $inboundOnDay,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'total_sent' => $totalSent,
                    'total_delivered' => $totalDelivered,
                    'total_read' => $totalRead,
                    'total_failed' => $totalFailed,
                    'total_inbound' => $totalInbound,
                    'delivery_rate' => $deliveryRate,
                    'read_rate' => $readRate,
                    'total_contacts' => $totalContacts,
                    'active_conversations' => $activeConversations,
                    'total_campaigns' => $totalCampaigns,
                ],
                'trend' => $trend,
            ],
        ]);
    }
}
