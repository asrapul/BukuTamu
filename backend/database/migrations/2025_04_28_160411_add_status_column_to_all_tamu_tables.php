<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        $tables = [
            'kepseks', 'perf_q_m_rs', 'keuangan_administrasis',
            'kurikulums', 'kesiswaans', 'sarpras',
            'hubins', 'ppdbs', 'gurus'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'status')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->string('status')->default('Pending')->nullable();
                });
            }
        }
    }

    public function down()
    {
        $tables = [
            'kepseks', 'perf_q_m_rs', 'keuangan_administrasis',
            'kurikulums', 'kesiswaans', 'sarpras',
            'hubins', 'ppdbs', 'gurus'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'status')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('status');
                });
            }
        }
    }
};
