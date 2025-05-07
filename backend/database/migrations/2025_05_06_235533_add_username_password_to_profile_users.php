<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUsernamePasswordToProfileUsers extends Migration
{
    public function up()
    {
        Schema::table('profile_users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('unit_kerja');
            $table->string('password')->nullable()->after('username');
        });
    }

    public function down()
    {
        Schema::table('profile_users', function (Blueprint $table) {
            $table->dropColumn(['username', 'password']);
        });
    }
}
