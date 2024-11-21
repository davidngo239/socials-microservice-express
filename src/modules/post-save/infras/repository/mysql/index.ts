import { IPostSaveRepository } from "@modules/post-save/interface";
import { ActionDTO, PostSave } from "@modules/post-save/model";
import { PostSaves } from "@prisma/client";
import prisma from "@shared/components/prisma";
import { Paginated, PagingDTO } from "@shared/model";

export class PrismaPostSaveRepository implements IPostSaveRepository {
  async get(data: ActionDTO): Promise<PostSave | null> {
    const result = await prisma.postSaves.findFirst({ where: data });

    if (!result) return null;

    return {
      userId: result.userId,
      postId: result.postId,
      createdAt: result.createdAt
    };
  }
  async insert(data: PostSave): Promise<boolean> {
    const persistenceData: PostSaves = {
      userId: data.userId,
      postId: data.postId,
      createdAt: data.createdAt,
    };

    await prisma.postSaves.create({ data: persistenceData });

    return true;
  }
  async delete(data: ActionDTO): Promise<boolean> {
    await prisma.postSaves.delete({
      where: {
        postId_userId: {
          postId: data.postId,
          userId: data.userId
        }
      }
    });

    return true;
  }
  async list(userId: string, paging: PagingDTO): Promise<Paginated<PostSave>> {
    const condition = { userId };

    const total = await prisma.postSaves.count({ where: condition });

    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.postSaves.findMany({
      where: condition,
      take: paging.limit,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: result,
      paging: paging,
      total
    };
  }

  async listPostIdsSaved(userId: string, postIds: string[]): Promise<string[]> {
    const result = await prisma.postSaves.findMany({ where: { userId, postId: { in: postIds } } });

    return result.map((item) => item.postId);
  }
}
