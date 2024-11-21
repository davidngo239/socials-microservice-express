/*
  Warnings:

  - Made the column `receiver_id` on table `chat_rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `chat_rooms` MODIFY `receiver_id` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `stories` MODIFY `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active';

-- RenameIndex
ALTER TABLE `post_tags` RENAME INDEX `user_id` TO `tag_id`;

-- RenameIndex
ALTER TABLE `stories` RENAME INDEX `stories_user_id_idx` TO `user_id`;
