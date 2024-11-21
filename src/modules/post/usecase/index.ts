import { v7 } from "uuid";
import { IEventPublisher } from "@shared/components/redis-pubsub/interface";
import { IAuthorRpc, Requester } from "@shared/interface";
import { AppError } from "@shared/utils/error";
import { IPostRepository, IPostUseCase, ITopicQueryRPC } from "../interfaces";
import { Post, Type } from "../model";
import { CreatePostDTO, createPostDTOSchema, UpdatePostDTO, updatePostDTOSchema } from "../model/dto";
import { ErrAuthorNotFound, ErrPostNotFound, ErrTopicNotFound } from "../model/error";
import { PostCreatedEvent, PostDeletedEvent } from "@shared/event/topic.evt";

export class PostUsecase implements IPostUseCase {
  constructor(
    private readonly repository: IPostRepository,
    private readonly topicRPC: ITopicQueryRPC,
    private readonly userRPC: IAuthorRpc,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async create(dto: CreatePostDTO): Promise<string> {
    const data = createPostDTOSchema.parse(dto)

    const topicExist = await this.topicRPC.findById(data.topicId);

    if (!topicExist) {
      throw AppError.from(ErrTopicNotFound, 404);
    }

    const authorExist = await this.userRPC.findById(data.authorId);

    if (!authorExist) {
      throw AppError.from(ErrAuthorNotFound, 404);
    }

    const newId = v7()
    const post: Post = {
      ...data,
      id: newId,
      isFeatured: false,
      topicId: topicExist.id,
      image: data.image ?? '',
      type: data.image ? Type.MEDIA : Type.TEXT,
      commentCount: 0,
      likedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.repository.insert(post);

    // publish event
    this.eventPublisher.publish(PostCreatedEvent.create({ userId: post.authorId, topicId: post.topicId }, newId));

    return newId;
  }

  async update(id: string, dto: UpdatePostDTO, requester: Requester): Promise<boolean> {
    const data = updatePostDTOSchema.parse(dto);

    const postExist = await this.repository.get(id);

    if (!postExist) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    if (postExist.authorId !== requester.sub) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    const updateDto: UpdatePostDTO = {
      ...data,
      type: data.image ? Type.MEDIA : Type.TEXT,
      updatedAt: new Date(),
    }

    const result = await this.repository.update(id, updateDto);

    return result;
  }

  async delete(id: string, requester: Requester): Promise<boolean> {
    const postExist = await this.repository.get(id);

    if (!postExist) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    if (postExist.authorId !== requester.sub) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    const result = await this.repository.delete(id);
   
    // publish event
    this.eventPublisher.publish(PostDeletedEvent.create({ userId: postExist.authorId, topicId: postExist.topicId }, postExist.id));

    return result;
  }
}