<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuickReply;
use App\Models\WhatsAppAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuickReplyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = QuickReply::query();

        if ($request->filled('whats_app_account_id')) {
            $query->where('whats_app_account_id', $request->query('whats_app_account_id'));
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where('name', 'like', "%{$s}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ]);
    }

    protected function rules(): array
    {
        return [
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'name' => 'required|string|max:255',
            'reply_text' => 'required|string|max:1024',
            'footer_text' => 'nullable|string|max:60',

            'header_type' => 'nullable|in:NONE,TEXT,IMAGE,VIDEO,DOCUMENT',
            'header_content' => 'nullable|string|max:2048',

            // Only one button is supported: a plain reply, or a single call-to-action link.
            'button_type' => 'nullable|in:NONE,REPLY_BUTTON,CTA_BUTTON',
            'buttons' => 'nullable|array|max:1',
            'buttons.*.type' => 'required_with:buttons|in:QUICK_REPLY,URL',
            'buttons.*.text' => 'required_with:buttons|string|max:25',
            'buttons.*.url' => 'required_if:buttons.*.type,URL|nullable|string|max:2048',
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $validated['whats_app_account_id'] = $validated['whats_app_account_id'] ?? WhatsAppAccount::first()?->id;
        $validated['header_type'] = $validated['header_type'] ?? 'NONE';
        $validated['button_type'] = $validated['button_type'] ?? 'NONE';

        $quickReply = QuickReply::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Quick reply created.',
            'data' => $quickReply,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => QuickReply::findOrFail($id),
        ]);
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



public function update(Request $request, $id): JsonResponse
{
    $quickReply = QuickReply::findOrFail($id);
    $oldHeaderContent = $quickReply->header_content;
    $oldHeaderType = $quickReply->header_type;

    $validated = $request->validate($this->rules());

    $validated['header_type'] = $validated['header_type'] ?? 'NONE';
    $validated['button_type'] = $validated['button_type'] ?? 'NONE';

    $newHeaderContent = $validated['header_content'] ?? null;
    $newHeaderType = $validated['header_type'];

    $oldWasMedia = in_array($oldHeaderType, ['IMAGE', 'VIDEO', 'DOCUMENT']);
    $newIsDifferent = $oldHeaderContent !== $newHeaderContent;

    if ($oldHeaderContent && $oldWasMedia && ($newIsDifferent || $newHeaderType === 'NONE' || $newHeaderType === 'TEXT')) {
        $this->deleteMediaFile($oldHeaderContent);
    }

    if (in_array($newHeaderType, ['NONE', 'TEXT']) && $newHeaderType === 'NONE') {
        $validated['header_content'] = null;
    }

    $quickReply->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Quick reply updated.',
        'data' => $quickReply,
    ]);
}

   public function destroy($id): JsonResponse
{
    $quickReply = QuickReply::findOrFail($id);

    if (
        $quickReply->header_content &&
        in_array($quickReply->header_type, ['IMAGE', 'VIDEO', 'DOCUMENT'])
    ) {
        $this->deleteMediaFile($quickReply->header_content);
    }

    $quickReply->delete();

    return response()->json([
        'success' => true,
        'message' => 'Quick reply removed.',
    ]);
}

    /**
     * Upload a header media file (image, video, or document) and return its public URL.
     */
    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,mp4,3gp,pdf,doc,docx|max:16384',
        ]);

        $path = $request->file('file')->store('quick-reply-media', 'public');

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'url' => url('storage/' . $path),
                // 'url' => Storage::disk('public')->url($path),
            ],
        ], 201);
    }
}