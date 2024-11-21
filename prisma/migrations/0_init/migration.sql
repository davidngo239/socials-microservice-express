-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(36) NOT NULL,
    `room_id` VARCHAR(36) NOT NULL,
    `sender_id` VARCHAR(36) NOT NULL,
    `content` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `room_id`(`room_id`),
    INDEX `sender_id`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_rooms` (
    `id` VARCHAR(36) NOT NULL,
    `creator_id` VARCHAR(36) NOT NULL,
    `receiver_id` VARCHAR(36) NULL,
    `type` ENUM('direct', 'group') NULL DEFAULT 'direct',
    `status` ENUM('pending', 'active', 'deleted') NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `creator_id`(`creator_id`),
    INDEX `receiver_id`(`receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_likes` (
    `comment_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    PRIMARY KEY (`comment_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,
    `parent_id` VARCHAR(36) NULL,
    `content` TEXT NOT NULL,
    `liked_count` INTEGER NOT NULL DEFAULT 0,
    `reply_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'approved', 'rejected', 'deleted', 'spam') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `parent_id`(`parent_id`),
    INDEX `post_id`(`post_id`),
    INDEX `status`(`status`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `followers` (
    `follower_id` VARCHAR(36) NOT NULL,
    `following_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    INDEX `follower_id`(`follower_id`),
    PRIMARY KEY (`following_id`, `follower_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `receiver_id` VARCHAR(36) NOT NULL,
    `content` TEXT NULL,
    `action` ENUM('liked', 'followed', 'replied') NULL,
    `is_sent` BOOLEAN NULL,
    `is_read` BOOLEAN NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `receiver_id`(`receiver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_likes` (
    `post_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_saves` (
    `post_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `post_id` VARCHAR(36) NOT NULL,
    `tag_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    INDEX `user_id`(`tag_id`),
    PRIMARY KEY (`post_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(255) NULL,
    `author_id` VARCHAR(36) NOT NULL,
    `topic_id` VARCHAR(36) NOT NULL,
    `is_featured` BOOLEAN NULL DEFAULT false,
    `comment_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `liked_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `type` ENUM('text', 'media') NULL DEFAULT 'text',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `author_id`(`author_id`),
    INDEX `is_featured`(`is_featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stories` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `content` TEXT NULL,
    `like_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `view_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `media` JSON NULL,
    `expires_at` TIMESTAMP(6) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `stories_created_at_idx`(`created_at`),
    INDEX `stories_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_likes` (
    `story_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    PRIMARY KEY (`story_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_views` (
    `story_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL,

    PRIMARY KEY (`story_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `post_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `post_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `cover` VARCHAR(255) NULL,
    `avatar` VARCHAR(255) NULL,
    `username` VARCHAR(100) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `salt` VARCHAR(50) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `bio` VARCHAR(255) NULL,
    `website_url` VARCHAR(255) NULL,
    `follower_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `post_count` INTEGER UNSIGNED NULL DEFAULT 0,
    `status` ENUM('active', 'pending', 'inactive', 'banned', 'deleted') NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `role`(`role`),
    INDEX `status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

