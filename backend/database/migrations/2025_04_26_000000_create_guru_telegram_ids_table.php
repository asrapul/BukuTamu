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
        Schema::create('guru_telegram_ids', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('telegram_id');
            $table->string('unit');
            $table->string('kehadiran')->default('hadir');
            $table->string('alasan_ketidakhadiran')->default('');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guru_telegram_ids');
    }
};
