import { AppEvent } from "@shared/model/event";

export const EvtCommentLiked = 'CommentLiked';
export const EvtCommentUnliked = 'CommentUnliked';

export type CommentLikeUnlikePayload = {
  commentId: string;
};

export class CommentLikedEvent extends AppEvent<CommentLikeUnlikePayload> {
  static create(payload: CommentLikeUnlikePayload, senderId: string) {
    return new CommentLikedEvent(EvtCommentLiked, payload, { senderId });
  }

  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CommentLikedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class CommentUnlikedEvent extends AppEvent<CommentLikeUnlikePayload> {
  static create(payload: CommentLikeUnlikePayload, senderId: string) {
    return new CommentUnlikedEvent(EvtCommentUnliked, payload, { senderId });
  }

  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CommentUnlikedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}