import { ICommentQueryRepository } from "@modules/comment-like/interface";

export class CommentQueryRPC implements ICommentQueryRepository {
  constructor(private readonly commentServiceUrl: string) { }

  async existed(commentId: string): Promise<boolean> {
    // const result = await axios.get(`${this.commentServiceUrl}/comments/${commentId}`);
    // return result.data;

    
    // TODO: Implement this
    return true;
  }
}