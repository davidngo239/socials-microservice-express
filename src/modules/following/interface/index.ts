import { Paginated, PagingDTO } from '@shared/model';
import { Follow, FollowCondDTO, FollowDTO, Follower } from '../model';

export interface IFollowingRepository {
  insert(follow: Follow): Promise<boolean>;
  delete(follow: FollowDTO): Promise<boolean>;
  find(cond: FollowDTO): Promise<Follow | null>;

  whoAmIFollowing(meId: string, ids: string[]): Promise<Follow[]>;
  list(cond: FollowCondDTO, paging: PagingDTO): Promise<Paginated<Follow>>;
}

export interface IFollowingUsecase {
  follow(follow: FollowDTO): Promise<boolean>;
  hasFollowed(followerId: string, followingId: string): Promise<boolean>;
  unfollow(follow: FollowDTO): Promise<boolean>;
  listFollowers(userId: string, paging: PagingDTO): Promise<Paginated<Follower>>;
  listFollowings(userId: string, paging: PagingDTO): Promise<Paginated<Follower>>;
}
