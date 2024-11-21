import { IPostLikeRepository } from '@modules/post-like/interface';
import { ActionDTO, PostLike } from '@modules/post-like/model';
import prisma from '@shared/components/prisma';
import { Paginated, PagingDTO } from '@shared/model';

export class MysqlPostLikeRepository implements IPostLikeRepository {
  async get(data: ActionDTO): Promise<PostLike | null> {
    const result = await prisma.postLikes.findFirst({ where: data });
    if (!result) {
      return null;
    }

    return result;
  }

  async insert(data: PostLike): Promise<boolean> {
    await prisma.postLikes.create({ data: data });

    return true;
  }

  async delete(data: ActionDTO): Promise<boolean> {
    await prisma.postLikes.delete({
      where: {
        postId_userId: {
          postId: data.postId,
          userId: data.userId
        }
      }
    });

    return true;
  }

  async list(postId: string, paging: PagingDTO): Promise<Paginated<PostLike>> {
    const total = await prisma.postLikes.count({ where: { postId } });

    const skip = (paging.page - 1) * paging.limit;

    const items = await prisma.postLikes.findMany({
      where: { postId },
      take: paging.limit,
      skip,
      orderBy: { createdAt: 'desc' }
    });

    return {
      data: items,
      paging,
      total
    };
  }

  async listPostIdsLiked(userId: string, postIds: string[]): Promise<Array<string>> {
    const result = await prisma.postLikes.findMany({ where: { userId, postId: { in: postIds } } });
    return result.map((item) => item.postId);
  }
}
