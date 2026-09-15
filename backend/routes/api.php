<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\WhatsAppAccountController;
use App\Http\Controllers\Api\WhatsAppPhoneNumberController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - WhatsApp Business API SaaS (Model 1: Tech Provider)
|--------------------------------------------------------------------------
*/

Route::post('/auth/signin', [AuthController::class, 'signin']);
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Meta Webhook Endpoints (Publicly reachable for Meta handshake & event notifications)
Route::get('/webhook/meta', [WebhookController::class, 'verify']);
Route::post('/webhook/meta', [WebhookController::class, 'handle']);

// WhatsApp Accounts & Setup (Embedded Signup callback & connection)
Route::prefix('whatsapp')->group(function () {
    Route::get('/accounts', [WhatsAppAccountController::class, 'index']);
    Route::post('/accounts', [WhatsAppAccountController::class, 'store']);
    Route::get('/accounts/{id}', [WhatsAppAccountController::class, 'show']);
    Route::delete('/accounts/{id}', [WhatsAppAccountController::class, 'destroy']);

    // Phone Numbers
    Route::get('/accounts/{accountId}/phone-numbers', [WhatsAppPhoneNumberController::class, 'index']);
    Route::post('/accounts/{accountId}/phone-numbers', [WhatsAppPhoneNumberController::class, 'store']);
    Route::post('/accounts/{accountId}/phone-numbers/sync', [WhatsAppPhoneNumberController::class, 'sync']);
});

    // Contacts Management
    Route::prefix('contacts')->group(function () {
        Route::get('/', [ContactController::class, 'index']);
        Route::post('/', [ContactController::class, 'store']);
        Route::post('/import', [ContactController::class, 'import']);
         Route::post('/import-csv', [ContactController::class, 'importCsv']);
        Route::get('/{id}', [ContactController::class, 'show']);
        Route::put('/{id}', [ContactController::class, 'update']);
        Route::delete('/{id}', [ContactController::class, 'destroy']);
    });

// Conversations & Inbox
Route::prefix('conversations')->group(function () {
    Route::get('/', [ConversationController::class, 'index']);
    Route::get('/{id}', [ConversationController::class, 'show']);
    Route::put('/{id}/status', [ConversationController::class, 'updateStatus']);
    Route::get('/{id}/messages', [MessageController::class, 'index']);
});

// Messaging
Route::prefix('messages')->group(function () {
    Route::post('/reply', [MessageController::class, 'send']);
    Route::post('/single-send', [MessageController::class, 'singleSend']);
});

// WhatsApp Templates
Route::prefix('templates')->group(function () {
    Route::get('/', [TemplateController::class, 'index']);
    Route::post('/', [TemplateController::class, 'store']);
    Route::get('/{id}', [TemplateController::class, 'show']);
    Route::delete('/{id}', [TemplateController::class, 'destroy']);
    Route::post('/sync/{accountId}', [TemplateController::class, 'sync']);
});

// Broadcast Campaigns
Route::prefix('campaigns')->group(function () {
    Route::get('/', [CampaignController::class, 'index']);
    Route::post('/', [CampaignController::class, 'store']);
    Route::get('/{id}', [CampaignController::class, 'show']);
    Route::post('/{id}/send', [CampaignController::class, 'send']);
});

// Dashboard Analytics
Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
