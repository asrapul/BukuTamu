<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileUser extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $fillable = [
        'user_id',
        'nama_lengkap',  // Menambahkan nama_lengkap
        'nip',            // Menambahkan nip
        'unit_kerja',     // Menambahkan unit_kerja
    ];
}