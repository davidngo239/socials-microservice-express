/*
  Warnings:

  - Added the required column `color` to the `topics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `topics` ADD COLUMN `color` VARCHAR(10) NOT NULL;
