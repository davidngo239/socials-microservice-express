import { PublicUser } from '@shared/model';
import z from 'zod';

export const followDTOSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid()
});
export type FollowDTO = z.infer<typeof followDTOSchema>;

export const followCondDTOSchema = z.object({
  followingId: z.string().uuid().optional(),
  followerId: z.string().uuid().optional()
});

export type FollowCondDTO = z.infer<typeof followCondDTOSchema>;

export const followSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
  createdAt: z.date().default(new Date())
});
export type Follow = z.infer<typeof followSchema>;

export type Follower = PublicUser & {
  hasFollowedBack: boolean;
  followedAt: Date;
};
