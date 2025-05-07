<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keuangan_Administrasi extends Model
{
    use HasFactory;

    protected $table = 'keuangan_administrasis'; // Pastikan ini sesuai dengan nama tabel

    protected $fillable = ['nama_tamu', 'instansi', 'tujuan', 'nama_yang_dikunjungi', 'keperluan', 'kartu_identitas','nomor_identitas', 'nomor_telepon', 'created_at','status', 'read'];

    protected $casts = [
        'read' => 'boolean', // Mengubah 'read' menjadi boolean
    ];
}
