<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';

    protected $fillable = [
        'whats_app_account_id',
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'group_name',
        'tags',
        'custom_fields',
        'status',
    ];

    protected $casts = [
        'tags' => 'array',
        'custom_fields' => 'array',
    ];

    public function whatsAppAccount()
    {
        return $this->belongsTo(WhatsAppAccount::class, 'whats_app_account_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'contact_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'contact_id');
    }

    public function campaignRecipients()
    {
        return $this->hasMany(CampaignRecipient::class, 'contact_id');
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}") ?: $this->phone_number;
    }
}
