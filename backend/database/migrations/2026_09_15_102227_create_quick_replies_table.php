<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quick_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whats_app_account_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->text('reply_text');
            $table->string('footer_text')->nullable();

            // Header
            $table->enum('header_type', ['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'])->default('NONE');
            $table->string('header_content')->nullable(); // header text OR uploaded media URL

            // Buttons
            $table->enum('button_type', ['NONE', 'REPLY_BUTTON', 'CTA_BUTTON'])->default('NONE');
            $table->json('buttons')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quick_replies');
    }
};