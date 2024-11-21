import { IEventPublisher } from '@shared/components/redis-pubsub/interface';

import { PostCommentDeletedEvent, PostCommentedEvent } from '@shared/event/post.evt';
import { IAuthorRpc, IPostRpc, Requester } from '@shared/interface';
import { Paginated, PagingDTO, PublicUser } from '@shared/model';
import { AppError, ErrNotFound } from '@shared/utils/error';
import { v7 } from 'uuid';
import { Comment, commentStatus } from '../model/comment';
import { CommentCondDTO, CommentCreateDTO, commentCreateDTOSchema, CommentUpdateDTO } from '../model/dto';
import { ErrInvalidParentId, ErrPostNotFound } from '../model/error';
import { ICommentRepository, ICommentUseCase } from '../model/interface';

export class CommentUsecase implements ICommentUseCase {
  constructor(
    private readonly repository: ICommentRepository,
    private readonly postRpc: IPostRpc,
    private readonly userRpc: IAuthorRpc,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async create(dto: CommentCreateDTO): Promise<string> {
    const data = commentCreateDTOSchema.parse(dto);

    const postExist = await this.postRpc.findById(data.postId);

    if (!postExist) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    let authorIdOfParentComment: string | null = null;

    if (data.parentId) {
      const parentComment = await this.repository.findById(data.parentId);
      if (!parentComment) throw AppError.from(ErrInvalidParentId, 400);
      // cannot reply to a replied comment
      if (parentComment.parentId) throw AppError.from(ErrInvalidParentId, 400);

      authorIdOfParentComment = parentComment.userId;
    }

    const newId = v7();
    const model: Comment = {
      id: newId,
      userId: data.userId,
      postId: data.postId,
      parentId: data.parentId ?? null,
      content: data.content,
      status: commentStatus.APPROVED,
      replyCount: 0,
      likedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.repository.insert(model);

    // Publish event
    this.eventPublisher.publish(
      PostCommentedEvent.create({ postId: data.postId, authorIdOfParentComment }, data.userId)
    );

    return newId;
  }

  async update(id: string, requester: Requester, dto: CommentUpdateDTO): Promise<boolean> {
    const oldData = await this.repository.findById(id);
    if (!oldData || oldData.status === commentStatus.DELETED || oldData.userId !== requester.sub) throw ErrNotFound;

    const updateDTO: CommentUpdateDTO = {
      content: dto.content
    };
    const ok = await this.repository.update(id, updateDTO);

    return ok;
  }

  async delete(requester: Requester, id: string): Promise<boolean> {
    const oldData = await this.repository.findById(id);
    if (!oldData || oldData.status === commentStatus.DELETED || oldData.userId !== requester.sub) {
      throw ErrNotFound;
    }

    await this.repository.delete(id);

    // publish event
    this.eventPublisher.publish(PostCommentDeletedEvent.create({ postId: oldData.postId }, oldData.userId));

    return true;
  }

  async findById(id: string): Promise<Comment> {
    const data = await this.repository.findById(id);
    if (!data || data.status == commentStatus.DELETED) throw ErrNotFound;

    return data;
  }

  async list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>> {
    const result = await this.repository.list(dto, paging);

    const commentIds = result.data.map((item) => item.id);
    if (commentIds.length === 0) {
      return result;
    }
    const replies = await this.repository.findByIds(commentIds, 'parent_id', 3);
    const repliesMap: Record<string, Comment[]> = {};
    replies.forEach((reply) => {
      if (!repliesMap[reply.parentId!]) {
        repliesMap[reply.parentId!] = [];
      }
      repliesMap[reply.parentId!].push(reply);
    });

    const userIds = [...new Set([...result.data.map((item) => item.userId), ...replies.map((reply) => reply.userId)])];
    const users = await this.userRpc.findByIds(userIds);
    const userMap: Record<string, PublicUser> = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    const finalResult = result.data.map((item) => ({
      ...item,
      user: userMap[item.userId],
      children: (repliesMap[item.id] || []).map((reply) => ({
        ...reply,
        user: userMap[reply.userId]
      }))
    }));

    return {
      ...result,
      data: finalResult
    };
  }
}
