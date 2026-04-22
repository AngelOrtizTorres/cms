<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');

            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('path', 255);
            $table->unsignedTinyInteger('depth')->default(0);

            $table->unsignedBigInteger('commentable_id');
            $table->string('commentable_type');

            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->string('email');
            $table->text('content');

            $table->enum('status', ['pending', 'approved', 'rejected', 'spam'])->default('pending');

            $table->unsignedInteger('reply_count')->default(0);
            $table->integer('upvotes')->default(0);
            $table->integer('downvotes')->default(0);

            // score will be added as a generated column below

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->useCurrent();
            $table->softDeletes();

            $table->foreign('user_id', 'fk_comments_user')->references('id')->on('users')->onDelete('set null');

            $table->index(['commentable_type', 'commentable_id', 'status', 'path'], 'idx_tree_load');
        });

        // Add generated column `score` as (upvotes - downvotes)
        try {
            DB::statement('ALTER TABLE comments ADD COLUMN score INT AS (upvotes - downvotes) VIRTUAL');
        } catch (\Exception $e) {
            // ignore if not supported
        }

        // Analytics index (attempt to create DESC index if supported)
        try {
            DB::statement('CREATE INDEX idx_analytics_score ON comments (commentable_type, commentable_id, score DESC)');
        } catch (\Exception $e) {
            // fallback to non-desc index
            try {
                DB::statement('CREATE INDEX idx_analytics_score ON comments (commentable_type, commentable_id, score)');
            } catch (\Exception $e) {
                // ignore
            }
        }
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
}
