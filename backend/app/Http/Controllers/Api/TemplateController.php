<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    public function index(Request $request): JsonResponse
    {
        $accountId = $request->query('whats_app_account_id');
        $query = Template::query();

        if ($accountId) {
            $query->where('whats_app_account_id', $accountId);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where('name', 'like', "%{$s}%");
        }

        $templates = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'name' => 'required|string|regex:/^[a-z0-9_]+$/',
            'category' => 'required|in:MARKETING,UTILITY,AUTHENTICATION',
            'language' => 'required|string',
            'header_type' => 'nullable|string',
            'header_content' => 'nullable|string',
            'body_text' => 'required|string',
            'footer_text' => 'nullable|string',
            'buttons' => 'nullable|array',
            'sample_variables' => 'nullable|array',
        ]);

        $accountId = $validated['whats_app_account_id'] ?? WhatsAppAccount::first()?->id;
        $validated['whats_app_account_id'] = $accountId;
        $validated['status'] = 'APPROVED'; // Mock approved for instant testing

        $template = Template::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template created.',
            'data' => $template,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $template = Template::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    public function sync($accountId): JsonResponse
    {
        $account = WhatsAppAccount::findOrFail($accountId);
        $res = $this->whatsAppService->syncTemplates($account);

        return response()->json($res);
    }

    public function destroy($id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template removed.',
        ]);
    }
}
