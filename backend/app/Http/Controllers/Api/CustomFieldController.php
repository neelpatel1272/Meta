<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomFieldController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CustomField::latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:text,number,date',
        ]);

        $field = CustomField::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Custom field created successfully.',
            'data' => $field,
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        $field = CustomField::findOrFail($id);
        $field->delete();

        return response()->json([
            'success' => true,
            'message' => 'Custom field deleted successfully.',
        ]);
    }
}