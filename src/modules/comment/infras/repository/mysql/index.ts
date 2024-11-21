import { Comment, commentStatus } from '@modules/comment/model/comment';
import { CommentCondDTO, CommentUpdateDTO } from '@modules/comment/model/dto';
import { ICommentRepository } from '@modules/comment/model/interface';
import { Comments } from '@prisma/client';
import prisma from '@shared/components/prisma';
import { Paginated, PagingDTO } from '@shared/model';
import { ErrNotFound } from '@shared/utils/error';

export class MysqlCommentRepository implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    const comment = await prisma.comments.findFirst({ where: { id } });
    if (!comment) return null;

    return { ...comment, status: comment.status as commentStatus, updatedAt: comment.updatedAt! };
  }

  async findByCond(cond: CommentCondDTO): Promise<Comment> {
    const conditions: Record<string, any> = {};
    if (cond.postId) {
      conditions.postId = cond.postId;
    }
    if (cond.parentId) {
      conditions.parentId = cond.parentId;
    }

    const comment = await prisma.comments.findFirst({ where: conditions });
    if (!comment) throw ErrNotFound;

    return { ...comment, status: comment.status as commentStatus, updatedAt: comment.updatedAt! };
  }

  async findByIds(ids: string[], field: string, limit?: number): Promise<Array<Comment>> {
    const sql = ids
      .map((id) => `(SELECT * FROM comments WHERE ${field} = '${id}' ORDER BY id ASC LIMIT ${limit})`)
      .join(' UNION ');
    const replies = await prisma.$queryRawUnsafe<any[]>(sql);
    return replies.map((item) => ({
      id: item.id,
      userId: item.user_id,
      postId: item.post_id,
      parentId: item.parent_id,
      content: item.content,
      likedCount: item.liked_count,
      replyCount: item.reply_count,
      status: item.status as commentStatus,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  async list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>> {
    const conditions: Record<string, any> = {};
    if (dto.postId) {
      conditions.postId = dto.postId;
    }
    if (dto.parentId) {
      conditions.parentId = dto.parentId;
    } else {
      conditions.parentId = null;
    }

    const total = await prisma.comments.count({
      where: { ...conditions, status: { not: commentStatus.DELETED } }
    });

    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.comments.findMany({
      where: conditions,
      take: paging.limit,
      skip,
      orderBy: {
        id: 'asc'
      }
    });

    return {
      data: result.map((item) => ({ ...item, status: item.status as commentStatus, updatedAt: item.updatedAt! })),
      paging: paging,
      total
    };
  }

  async insert(dto: Comment): Promise<boolean> {
    const data: Comments = {
      id: dto.id,
      userId: dto.userId,
      postId: dto.postId,
      parentId: dto.parentId,
      content: dto.content,
      replyCount: dto.replyCount,
      likedCount: dto.likedCount,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };

    await prisma.comments.create({ data });

    return true;
  }

  async update(id: string, dto: CommentUpdateDTO): Promise<boolean> {
    await prisma.comments.update({
      where: { id },
      data: { content: dto.content, updatedAt: new Date() }
    });

    return true;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.comments.delete({ where: { id } });

    return true;
  }

  async increaseLikeCount(id: string, field: string, step: number): Promise<boolean> {
    await prisma.comments.update({
      where: { id },
      data: { [field]: { increment: step } }
    });

    return true;
  }

  async decreaseLikeCount(id: string, field: string, step: number): Promise<boolean> {
    await prisma.comments.update({
      where: { id },
      data: { [field]: { decrement: step } }
    });

    return true;
  }
}
