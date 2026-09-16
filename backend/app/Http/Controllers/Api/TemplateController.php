<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\WhatsAppAccount;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    protected function templateRules(): array
    {
        return [
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'name' => 'required|string|max:512|regex:/^[a-z0-9_]+$/',
            'category' => 'required|in:MARKETING,UTILITY,AUTHENTICATION',
            'language' => 'required|string',

            'header_type' => 'nullable|in:NONE,TEXT,IMAGE,VIDEO,PDF,CAROUSEL',
            'header_content' => 'nullable|string|max:2048',

            'body_text' => 'required_unless:header_type,CAROUSEL|nullable|string|max:1024',
            'footer_text' => 'nullable|string|max:60',

            'buttons' => 'nullable|array|max:10',
            'buttons.*.type' => 'required_with:buttons|in:QUICK_REPLY,URL,PHONE_NUMBER,COPY_CODE,FLOW',
            'buttons.*.text' => 'required_with:buttons|string|max:25',
            'buttons.*.url' => 'required_if:buttons.*.type,URL|nullable|string|max:2048',
            'buttons.*.phone_number' => 'required_if:buttons.*.type,PHONE_NUMBER|nullable|string|max:20',
            'buttons.*.example' => 'required_if:buttons.*.type,COPY_CODE|nullable|string|max:50',

            'sample_variables' => 'nullable|array',
            'sample_variables.*' => 'nullable|string',

            'carousel_cards' => 'nullable|array|max:10',
            'carousel_cards.*.header_content' => 'nullable|string|max:2048',
            'carousel_cards.*.body_text' => 'required_with:carousel_cards|string|max:160',
            'carousel_cards.*.buttons' => 'nullable|array|max:2',
        ];
    }

    protected function assertButtonLimits(array $buttons): void
    {
        $limits = [
            'URL' => 2,
            'PHONE_NUMBER' => 1,
            'COPY_CODE' => 1,
            'FLOW' => 1,
        ];

        $counts = [];

        foreach ($buttons as $button) {
            $type = $button['type'] ?? null;

            if (!isset($limits[$type])) {
                continue;
            }

            $counts[$type] = ($counts[$type] ?? 0) + 1;

            if ($counts[$type] > $limits[$type]) {
                abort(422, "Too many '{$type}' buttons: max {$limits[$type]} allowed.");
            }
        }
    }

    protected function deleteMediaFile(?string $url): void
    {
        if (!$url) {
            return;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if (!$path) {
            return;
        }

        $path = ltrim($path, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->templateRules());

        $buttons = $validated['buttons'] ?? [];
        $this->assertButtonLimits($buttons);

        $accountId = $validated['whats_app_account_id'] ?? WhatsAppAccount::first()?->id;

        $validated['whats_app_account_id'] = $accountId;
        $validated['header_type'] = $validated['header_type'] ?? 'NONE';
        $validated['status'] = 'APPROVED';

        $template = Template::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template created.',
            'data' => $template,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $template = Template::findOrFail($id);

        $oldHeaderContent = $template->header_content;
        $oldHeaderType = $template->header_type;

        $validated = $request->validate($this->templateRules());

        $this->assertButtonLimits($validated['buttons'] ?? []);

        $validated['header_type'] = $validated['header_type'] ?? 'NONE';

        $newHeaderContent = $validated['header_content'] ?? null;
        $newHeaderType = $validated['header_type'];

        $oldWasMedia = in_array($oldHeaderType, [
            'IMAGE',
            'VIDEO',
            'PDF',
        ]);

        $newIsDifferent = $oldHeaderContent !== $newHeaderContent;

        if (
            $oldHeaderContent &&
            $oldWasMedia &&
            (
                $newIsDifferent ||
                $newHeaderType === 'NONE' ||
                $newHeaderType === 'TEXT'
            )
        ) {
            $this->deleteMediaFile($oldHeaderContent);
        }

        if ($newHeaderType === 'NONE') {
            $validated['header_content'] = null;
        }

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template updated.',
            'data' => $template,
        ]);
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

    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,mp4,3gp,pdf|max:16384',
        ]);

        $path = $request->file('file')->store('template-media', 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url' => url('storage/' . $path),
            ],
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        $template = Template::findOrFail($id);

        if (
            $template->header_content &&
            in_array($template->header_type, [
                'IMAGE',
                'VIDEO',
                'PDF',
            ])
        ) {
            $this->deleteMediaFile($template->header_content);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template removed.',
        ]);
    }
}