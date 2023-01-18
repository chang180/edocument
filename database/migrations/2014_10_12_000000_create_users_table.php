<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('staff_id')->nullable();
            $table->string('group')->nullable();
            $table->string('name')->nullable();
            $table->string('user_name')->nullable();
            $table->string('eng_name')->nullable();
            $table->string('password');
            $table->string('email')->unique();
            $table->string('dpt')->nullable();
            $table->string('jobtitle')->nullable();
            $table->string('auth')->nullable();
            $table->string('agent_staff_id')->nullable();
            $table->string('agent_group')->nullable();
            $table->string('is_enabled')->default('1');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
