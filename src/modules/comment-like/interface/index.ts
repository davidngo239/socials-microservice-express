import { Paginated, PagingDTO } from "@shared/model";
import { ActionDTO, CommentLike } from "../model";

export interface IUseCase {
  like(data: ActionDTO): Promise<boolean>
  unlike(data: ActionDTO): Promise<boolean>
}

export interface IRepository {
  get(data: ActionDTO): Promise<CommentLike | null>
  insert(data: CommentLike): Promise<boolean>
  delete(data: ActionDTO): Promise<boolean>
  list(commentId: string, paging: PagingDTO): Promise<Paginated<CommentLike>>
}

export interface ICommentQueryRepository {
  existed(commentId: string): Promise<boolean>
}

