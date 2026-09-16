<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuickReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'whats_app_account_id',
        'name',
        'reply_text',
        'footer_text',
        'header_type',
        'header_content',
        'button_type',
        'buttons',
    ];

    protected $casts = [
        'buttons' => 'array',
    ];

    public function whatsAppAccount()
    {
        return $this->belongsTo(WhatsAppAccount::class);
    }
}