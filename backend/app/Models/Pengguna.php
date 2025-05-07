<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengguna extends Model
{
    use HasFactory;

    protected $table = 'profile_users'; // <- WAJIB ditambahkan kalau nama tabel bukan jamak dari nama model

    protected $guarded = []; // <- Supaya semua kolom bisa diakses

    protected $fillable = [
        'nama_lengkap',
        'nip',
        'unit_kerja',
        'username',
        'password',
        'user_id'
    ];
}
