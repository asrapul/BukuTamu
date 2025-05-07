<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->unsignedBigInteger('user_id'); // ID pengguna
            $table->enum('user_type', ['gurus', 'hubins', 'kepseks', 'kesiswaans', 'keuangan_administrasis', 'kurikulums', 'perf_q_m_rs', 'ppdbs', 'sarpras']);
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamp('created_at')->useCurrent();

            // Optional: Tambahkan foreign key jika ada tabel users
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
