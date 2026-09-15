<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppAccount extends Model
{
    use HasFactory;

    protected $table = 'whats_app_accounts';

    protected $fillable = [
        'user_id',
        'name',
        'business_id',
        'waba_id',
        'status',
        'access_token',
        'meta_app_id',
    ];

    protected $hidden = [
        'access_token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function phoneNumbers()
    {
        return $this->hasMany(WhatsAppPhoneNumber::class, 'whats_app_account_id');
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class, 'whats_app_account_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'whats_app_account_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'whats_app_account_id');
    }

    public function templates()
    {
        return $this->hasMany(Template::class, 'whats_app_account_id');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'whats_app_account_id');
    }
}
