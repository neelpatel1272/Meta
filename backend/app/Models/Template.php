<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    protected $table = 'templates';

    protected $fillable = [
        'whats_app_account_id',
        'meta_template_id',
        'name',
        'category',
        'language',
        'status',
        'header_type',
        'header_content',
        'body_text',
        'footer_text',
        'buttons',
        'sample_variables',
        'rejection_reason',
    ];

    protected $casts = [
        'buttons' => 'array',
        'sample_variables' => 'array',
    ];

    public function whatsAppAccount()
    {
        return $this->belongsTo(WhatsAppAccount::class, 'whats_app_account_id');
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'template_id');
    }
}
