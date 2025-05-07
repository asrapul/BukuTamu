<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuruTelegramId extends Model
{
    use HasFactory;

    protected $table = 'guru_telegram_ids';

    protected $fillable = [
        'nama',
        'telegram_id',
        'unit',
        'kehadiran',
        'alasan_ketidakhadiran'
    ];

    protected $attributes = [
        'kehadiran' => 'hadir',
        'alasan_ketidakhadiran' => ''
    ];
}
