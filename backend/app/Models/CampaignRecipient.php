<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignRecipient extends Model
{
    use HasFactory;

    protected $table = 'campaign_recipients';

    protected $fillable = [
        'campaign_id',
        'contact_id',
        'phone_number',
        'variables',
        'status',
        'message_id',
        'sent_at',
        'error_message',
    ];

    protected $casts = [
        'variables' => 'array',
        'sent_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }
}
