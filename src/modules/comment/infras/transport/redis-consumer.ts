import { ICommentRepository } from "@modules/comment/model/interface";
import { RedisClient } from "@shared/components/redis-pubsub/redis";
import { CommentLikedEvent, CommentUnlikedEvent, EvtCommentLiked, EvtCommentUnliked } from "@shared/event/comment.evt";

export class RedisCommentConsumer {
  constructor(
    private readonly repository: ICommentRepository
  ) { }

  async handleCommentLiked(evt: CommentLikedEvent) {
    this.repository.increaseLikeCount(evt.payload.commentId, "likedCount", 1);
  }

  async handleCommentUnliked(evt: CommentUnlikedEvent) {
    this.repository.decreaseLikeCount(evt.payload.commentId, "likedCount", 1);
  }

  subscribe() {
    RedisClient.getInstance().subscribe(EvtCommentLiked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = CommentLikedEvent.from(data);
      this.handleCommentLiked(evt);
    });
    RedisClient.getInstance().subscribe(EvtCommentUnliked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = CommentUnlikedEvent.from(data);
      this.handleCommentUnliked(evt);
    });
  }
}
