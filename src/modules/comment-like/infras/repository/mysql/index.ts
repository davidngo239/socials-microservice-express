import { IRepository } from "@modules/comment-like/interface";
import { ActionDTO, CommentLike } from "@modules/comment-like/model";
import { CommentLikes } from "@prisma/client";
import prisma from "@shared/components/prisma";
import { Paginated, PagingDTO } from "@shared/model";

export class PrismaCommentLikeRepository implements IRepository {

  async get(data: ActionDTO): Promise<CommentLike | null> {
    const result = await prisma.commentLikes.findFirst({ where: data });

    if (!result) return null;

    return {
      userId: result.userId,
      commentId: result.commentId,
      createdAt: result.createdAt
    };
  }

  async insert(data: CommentLike): Promise<boolean> {
    const persistenceData: CommentLikes = {
      createdAt: data.createdAt,
      userId: data.userId,
      commentId: data.commentId
    };

    await prisma.commentLikes.create({ data: persistenceData });

    return true;
  }

  async delete(data: ActionDTO): Promise<boolean> {
    await prisma.commentLikes.delete({
      where: {
        commentId_userId: {
          commentId: data.commentId,
          userId: data.userId
        }
      }
    });

    return true;
  }

  async list(commentId: string, paging: PagingDTO): Promise<Paginated<CommentLike>> {
    const condition = {commentId};

    const total = await prisma.commentLikes.count({ where: condition });
    
    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.commentLikes.findMany({ 
      where: condition, 
      take: paging.limit,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: result.map((item) => ({
        userId: item.userId,
        commentId: item.commentId,
        createdAt: item.createdAt
      })),
      paging: paging,
      total
    };
  }
}