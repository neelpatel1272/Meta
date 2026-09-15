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
        Schema::create('whats_app_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whats_app_account_id')->constrained('whats_app_accounts')->cascadeOnDelete();
            $table->string('phone_number_id')->index();
            $table->string('phone_number');
            $table->string('display_name')->nullable();
            $table->string('verified_name')->nullable();
            $table->string('quality_rating')->default('UNKNOWN');
            $table->string('code_verification_status')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whats_app_phone_numbers');
    }
};
