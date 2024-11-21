import { AppError } from "@shared/utils/error";
import { ICommentQueryRepository, IRepository, IUseCase } from "../interface";
import { ActionDTO, actionDTOSchema, CommentLike } from "../model";
import { ErrCommentAlreadyLiked, ErrCommentHasNotLiked, ErrCommentNotFound } from "../model/error";
import { IEventPublisher } from "@shared/components/redis-pubsub/interface";
import { CommentLikedEvent, CommentUnlikedEvent } from "@shared/event/comment.evt";

export class CommentLikeUseCase implements IUseCase {
  constructor(
    private readonly repository: IRepository,
    private readonly commentQueryRepository: ICommentQueryRepository,
    private readonly eventPublisher: IEventPublisher
  ) { }

  async like(dto: ActionDTO): Promise<boolean> {
    const data = actionDTOSchema.parse(dto);
    const { userId, commentId } = data;

    // 1. Check if the user has already liked the comment
    const existedAction = await this.repository.get(data);

    if (existedAction) {
      throw AppError.from(ErrCommentAlreadyLiked, 400);
    }

    // 2. Check if the comment exists
    const existed = await this.commentQueryRepository.existed(commentId);

    if (!existed) {
      throw AppError.from(ErrCommentNotFound, 404);
    }

    // 3. Insert the like action
    const newData: CommentLike = { ...data, createdAt: new Date() }
    const result = await this.repository.insert(newData);

    // 4. Publish event
    this.eventPublisher.publish(CommentLikedEvent.create({ commentId }, userId));

    return result
  }

  async unlike(dto: ActionDTO): Promise<boolean> {
    const data = actionDTOSchema.parse(dto);

    // 1. Check if the user has already liked the comment
    const existedAction = await this.repository.get(data);

    if (!existedAction) {
      throw AppError.from(ErrCommentHasNotLiked, 400);
    }

    // 2. Delete the like action
    const result = await this.repository.delete(data);

    // 3. Publish event
    this.eventPublisher.publish(CommentUnlikedEvent.create({ commentId: data.commentId }, data.userId));
    
    return result
  }
}
