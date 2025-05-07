<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFormSubmissionsTable extends Migration
{
    public function up()
    {
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tamu');
            $table->string('instansi')->nullable();
            $table->string('tujuan');
            $table->string('nama_yang_dikunjungi');
            $table->text('keperluan');
            $table->string('kartu_identitas');
            $table->string('nomor_identitas');
            $table->string('nomor_telepon');
            $table->string('status')->default('Pending');
            $table->string('departemen');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('form_submissions');
    }
}
