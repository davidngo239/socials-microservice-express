import { IFollowingRepository } from '@modules/following/interface';
import { Follow, FollowCondDTO, FollowDTO } from '@modules/following/model';
import prisma from '@shared/components/prisma';
import { Paginated, PagingDTO } from '@shared/model';

export class MysqlFollowingRepository implements IFollowingRepository {

  async insert(follow: Follow): Promise<boolean> {
    await prisma.followers.create({
      data: follow
    });

    return true;
  }

  async delete(follow: FollowDTO): Promise<boolean> {
    await prisma.followers.delete({
      where: {
        followingId_followerId: {
          followerId: follow.followerId,
          followingId: follow.followingId
        }
      }
    });

    return true;
  }

  async find(cond: FollowDTO): Promise<Follow | null> {
    const result = await prisma.followers.findFirst({
      where: cond
    });

    return result;
  }

  async whoAmIFollowing(followingId: string, ids: string[]): Promise<Follow[]> {
    const result = await prisma.followers.findMany({
      where: {
        followingId: {
          in: ids
        },
        followerId: followingId
      }
    });

    return result;
  }

  async list(cond: FollowCondDTO, paging: PagingDTO): Promise<Paginated<Follow>> {
    const count = await prisma.followers.count({
      where: cond
    });

    const skip = (paging.page - 1) * paging.limit;
    const result = await prisma.followers.findMany({
      where: cond,
      skip,
      take: paging.limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: result,
      paging,
      total: count
    };
  }
}
