<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\WhatsAppAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accountId = $request->query('whats_app_account_id');
        $query = Contact::query();

        if ($accountId) {
            $query->where('whats_app_account_id', $accountId);
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('phone_number', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        if ($request->filled('group_name')) {
            $query->where('group_name', $request->query('group_name'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $contacts = $query->latest()->paginate($request->query('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $contacts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone_number' => 'required|string',
            'email' => 'nullable|email',
            'group_name' => 'nullable|string',
            'tags' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ]);

        if (empty($validated['whats_app_account_id'])) {
            $account = WhatsAppAccount::first();
            $validated['whats_app_account_id'] = $account?->id;
        }

        $contact = Contact::updateOrCreate(
            [
                'whats_app_account_id' => $validated['whats_app_account_id'],
                'phone_number' => preg_replace('/[^0-9]/', '', $validated['phone_number']),
            ],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact saved successfully.',
            'data' => $contact,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $contact = Contact::with(['conversations.messages'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $contact,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string',
            'email' => 'nullable|email',
            'group_name' => 'nullable|string',
            'tags' => 'nullable|array',
            'custom_fields' => 'nullable|array',
            'status' => 'nullable|in:active,unsubscribed,blocked',
        ]);

        if (isset($validated['phone_number'])) {
            $validated['phone_number'] = preg_replace('/[^0-9]/', '', $validated['phone_number']);
        }

        $contact->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Contact updated.',
            'data' => $contact,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact deleted.',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'contacts' => 'required|array',
            'contacts.*.phone_number' => 'required|string',
        ]);

        $accountId = $request->input('whats_app_account_id') ?? WhatsAppAccount::first()?->id;

        [$created, $skipped] = $this->saveContacts($request->input('contacts'), $accountId);

        return response()->json([
            'success' => true,
            'message' => "Successfully imported {$created} contacts.",
            'count' => $created,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Import contacts directly from an uploaded CSV file.
     * Expected header row (case-insensitive, any order):
     * first_name,last_name,phone_number,email,group_name,tags
     * Only phone_number is required per row; tags can be separated by ; or |
     */
    public function importCsv(Request $request): JsonResponse
    {
        $request->validate([
            'whats_app_account_id' => 'nullable|exists:whats_app_accounts,id',
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $accountId = $request->input('whats_app_account_id') ?? WhatsAppAccount::first()?->id;

        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');

        if ($handle === false) {
            throw ValidationException::withMessages([
                'file' => 'Unable to read the uploaded file.',
            ]);
        }

        // Strip a UTF-8 BOM if present, then read the header row.
        $firstLine = fgets($handle);
   $firstLine = preg_replace('/^\xEF\xBB\xBF/', '', $firstLine);
        rewind($handle);
        fgets($handle); // advance past header line since we already peeked it
        $header = str_getcsv($firstLine);
        $header = array_map(fn ($h) => strtolower(trim($h)), $header);

        $required = ['phone_number'];
        foreach ($required as $col) {
            if (!in_array($col, $header, true)) {
                fclose($handle);
                throw ValidationException::withMessages([
                    'file' => "CSV is missing required column: {$col}",
                ]);
            }
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === 1 && trim($row[0]) === '') {
                continue; // skip blank lines
            }

            $assoc = [];
            foreach ($header as $i => $col) {
                $assoc[$col] = $row[$i] ?? null;
            }

            $tags = null;
            if (!empty($assoc['tags'])) {
                $tags = array_values(array_filter(array_map('trim', preg_split('/[;|]/', $assoc['tags']))));
            }

            $rows[] = [
                'first_name' => $assoc['first_name'] ?? null,
                'last_name' => $assoc['last_name'] ?? null,
                'phone_number' => $assoc['phone_number'] ?? null,
                'email' => $assoc['email'] ?? null,
                'group_name' => $assoc['group_name'] ?? null,
                'tags' => $tags,
            ];
        }

        fclose($handle);

        [$created, $skipped] = $this->saveContacts($rows, $accountId);

        return response()->json([
            'success' => true,
            'message' => "Successfully imported {$created} contacts.",
            'count' => $created,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Shared save/upsert logic used by both JSON and CSV import paths.
     *
     * @return array{0:int,1:int} [createdOrUpdatedCount, skippedCount]
     */
    private function saveContacts(array $items, ?int $accountId): array
    {
        $created = 0;
        $skipped = 0;

        foreach ($items as $item) {
            $rawPhone = $item['phone_number'] ?? '';
            $cleanPhone = preg_replace('/[^0-9]/', '', (string) $rawPhone);

            if (!$cleanPhone) {
                $skipped++;
                continue;
            }

            Contact::updateOrCreate(
                [
                    'whats_app_account_id' => $accountId,
                    'phone_number' => $cleanPhone,
                ],
                [
                    'first_name' => $item['first_name'] ?? null,
                    'last_name' => $item['last_name'] ?? null,
                    'email' => $item['email'] ?? null,
                    'group_name' => $item['group_name'] ?? null,
                    'tags' => $item['tags'] ?? null,
                    'status' => 'active',
                ]
            );
            $created++;
        }

        return [$created, $skipped];
    }
}