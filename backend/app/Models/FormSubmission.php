<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_tamu',
        'instansi',
        'tujuan',
        'nama_yang_dikunjungi',
        'keperluan',
        'kartu_identitas',
        'nomor_identitas',
        'nomor_telepon',
        'status',
    ];
}

class Departemen extends Model
{
    use HasFactory;

    protected $fillable = [
        'departemen'
    ];
}
