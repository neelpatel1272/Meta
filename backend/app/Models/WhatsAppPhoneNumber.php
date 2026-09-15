<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppPhoneNumber extends Model
{
    use HasFactory;

    protected $table = 'whats_app_phone_numbers';

    protected $fillable = [
        'whats_app_account_id',
        'phone_number_id',
        'phone_number',
        'display_name',
        'verified_name',
        'quality_rating',
        'code_verification_status',
        'status',
    ];

    public function whatsAppAccount()
    {
        return $this->belongsTo(WhatsAppAccount::class, 'whats_app_account_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'whats_app_phone_number_id');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'whats_app_phone_number_id');
    }
}
