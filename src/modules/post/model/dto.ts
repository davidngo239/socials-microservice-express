import z from "zod";
import { Type } from ".";
import { ErrMinContent, ErrURLInvalid } from "./error";

export const createPostDTOSchema = z.object({
  content: z.string().min(1, { message: ErrMinContent(1).message }),
  image: z.string().url({ message: ErrURLInvalid.message }).optional(),
  authorId: z.string().uuid(),
  topicId: z.string().uuid(),
});

export type CreatePostDTO = z.infer<typeof createPostDTOSchema>;

export const updatePostDTOSchema = z.object({
  content: z.string().min(1, { message: ErrMinContent(1).message }).optional(),
  image: z.string().optional(),
  topicId: z.string().uuid().optional(),
  isFeatured: z.boolean().optional(),
  type: z.nativeEnum(Type).optional(),
  commentCount: z.number().int().nonnegative(),
  likedCount: z.number().int().nonnegative(),
  updatedAt: z.date().optional(),
}).partial();

export type UpdatePostDTO = z.infer<typeof updatePostDTOSchema>;