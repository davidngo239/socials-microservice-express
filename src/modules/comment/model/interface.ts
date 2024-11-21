import { Paginated, PagingDTO } from '@shared/model'
import { Comment } from './comment'
import { CommentCondDTO, CommentCreateDTO, CommentUpdateDTO } from './dto'
import { Requester } from '@shared/interface'

export interface ICommentRepository extends ICommentQueryRepository, ICommentCommandRepository {
 increaseLikeCount(id: string, field: string, step: number): Promise<boolean>
 decreaseLikeCount(id: string, field: string, step: number): Promise<boolean>
}
export interface ICommentUseCase {
 create(dto: CommentCreateDTO): Promise<string>
 update(id: string, requester: Requester, dto: CommentUpdateDTO): Promise<boolean>
 delete(requester: Requester, id: string): Promise<boolean>
 findById(id: string): Promise<Comment>
 list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>>
}

export interface ICommentQueryRepository {
 findById(id: string): Promise<Comment | null>
 list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>>
 findByCond(cond: CommentCondDTO): Promise<Comment>
 findByIds(ids: string[], field: string, limit?: number): Promise<Array<Comment>>
}
export interface ICommentCommandRepository {
 insert(dto: Comment): Promise<boolean>
 update(id: string, dto: CommentUpdateDTO): Promise<boolean>
 delete(id: string): Promise<boolean>
}
