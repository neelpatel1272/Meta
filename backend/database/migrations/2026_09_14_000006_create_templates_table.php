<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whats_app_account_id')->constrained('whats_app_accounts')->cascadeOnDelete();
            $table->string('meta_template_id')->nullable()->index();
            $table->string('name');
            $table->enum('category', ['MARKETING', 'UTILITY', 'AUTHENTICATION'])->default('MARKETING');
            $table->string('language')->default('en_US');
            $table->enum('status', ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED'])->default('PENDING');
            $table->string('header_type')->nullable(); // TEXT, IMAGE, VIDEO, DOCUMENT, NONE
            $table->text('header_content')->nullable();
            $table->text('body_text');
            $table->text('footer_text')->nullable();
            $table->json('buttons')->nullable();
            $table->json('sample_variables')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
