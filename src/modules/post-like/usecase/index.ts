import { IEventPublisher } from '@shared/components/redis-pubsub/interface';
import { PostLikedEvent, PostUnlikedEvent } from '@shared/event/post.evt';
import { AppError, ErrNotFound } from '@shared/utils/error';
import { IPostLikeRepository, IPostLikeUseCase, IPostQueryRepository } from '../interface';
import { ActionDTO, actionDTOSchema, PostLike } from '../model';
import { ErrPostAlreadyLiked, ErrPostHasNotLiked } from '../model/error';

export class PostLikeUsecase implements IPostLikeUseCase {
  constructor(
    private readonly repo: IPostLikeRepository,
    private readonly postRpc: IPostQueryRepository,
    private readonly eventPublisher: IEventPublisher,
  ) { }

  async like(data: ActionDTO): Promise<boolean> {
    const parseData = actionDTOSchema.parse(data);
    const postExist = await this.postRpc.existed(parseData.postId);
    if (!postExist) {
      throw ErrNotFound;
    }

    const existed = await this.repo.get(parseData);
    if (existed) {
      throw AppError.from(ErrPostAlreadyLiked, 400);
    }

    await this.repo.insert({ ...parseData, createdAt: new Date() } as PostLike);

    // publish event
    this.eventPublisher.publish(PostLikedEvent.create({ postId: parseData.postId }, parseData.userId));

    return true;
  }
  async unlike(data: ActionDTO): Promise<boolean> {
    const parseData = actionDTOSchema.parse(data);

    const postExist = await this.postRpc.existed(parseData.postId);
    if (!postExist) {
      throw ErrNotFound;
    }

    const existed = await this.repo.get(parseData);
    if (!existed) {
      throw AppError.from(ErrPostHasNotLiked, 400);
    }

    await this.repo.delete(parseData);

    // publish event
    this.eventPublisher.publish(PostUnlikedEvent.create({ postId: parseData.postId }, parseData.userId));

    return true;
  }
}
