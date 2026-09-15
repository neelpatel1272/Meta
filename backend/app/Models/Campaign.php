<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $table = 'campaigns';

    protected $fillable = [
        'whats_app_account_id',
        'whats_app_phone_number_id',
        'template_id',
        'name',
        'status',
        'scheduled_at',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'read_count',
        'failed_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'delivered_count' => 'integer',
        'read_count' => 'integer',
        'failed_count' => 'integer',
    ];

    public function whatsAppAccount()
    {
        return $this->belongsTo(WhatsAppAccount::class, 'whats_app_account_id');
    }

    public function phoneNumber()
    {
        return $this->belongsTo(WhatsAppPhoneNumber::class, 'whats_app_phone_number_id');
    }

    public function template()
    {
        return $this->belongsTo(Template::class, 'template_id');
    }

    public function recipients()
    {
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    }
}
