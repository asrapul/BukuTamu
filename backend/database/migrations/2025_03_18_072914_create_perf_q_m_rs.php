<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('perf_q_m_rs')) {
        Schema::create('perf_q_m_rs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tamu');
            $table->string('instansi');
            $table->string('tujuan');
            $table->string('nama_yang_dikunjungi');
            $table->text('keperluan');
            $table->string('kartu_identitas');
            $table->string('nomor_identitas');
            $table->string('nomor_telepon');
            $table->timestamps();
        });
    }
    }

    public function down(): void
    {
        Schema::dropIfExists('perf_q_m_rs');
    }
};
