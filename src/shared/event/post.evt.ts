import { AppEvent } from "@shared/model/event";

export const EvtPostLiked = 'PostLiked';
export const EvtPostUnliked = 'PostUnliked';
export const EvtPostCommented = 'PostCommented';
export const EvtPostCommentDeleted = 'PostCommentDeleted';

// export type PostLikeUnlikePayload = {
//   postId: string;
// };

export type PostEventPayload = {
  postId: string;
  authorIdOfParentComment?: string | null; // for replied comment event
};

// export class PostLikedEvent extends AppEvent<PostLikeUnlikePayload> {
//   static create(payload: PostLikeUnlikePayload, senderId: string) {
//     return new PostLikedEvent(EvtPostLiked, payload, { senderId });
//   }

//   static from(json: any) {
//     const { eventName, payload, id, occurredAt, senderId } = json;
//     return new PostLikedEvent(eventName, payload, { id, occurredAt, senderId });
//   }
// }

// export class PostUnlikedEvent extends AppEvent<PostLikeUnlikePayload> {
//   static create(payload: PostLikeUnlikePayload, senderId: string) {
//     return new PostUnlikedEvent(EvtPostUnliked, payload, { senderId });
//   }

//   static from(json: any) {
//     const { eventName, payload, id, occurredAt, senderId } = json;
//     return new PostUnlikedEvent(eventName, payload, { id, occurredAt, senderId });
//   }
// }
export class PostEvent<T extends PostEventPayload> extends AppEvent<T> {
  protected constructor(
    eventName: string,
    payload: T,
    options: { id?: string; occurredAt?: Date; senderId: string; }
  ) {
    super(eventName, payload, options);
  }

  protected static createEvent<T extends PostEventPayload>(
    eventName: string,
    payload: T,
    senderId: string
  ): PostEvent<T> {
    return new PostEvent(eventName, payload, { senderId });
  }

  protected static fromJson<T extends PostEventPayload>(json: any): PostEvent<T> {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

export class PostLikedEvent extends PostEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string): PostLikedEvent {
    return PostEvent.createEvent(EvtPostLiked, payload, senderId) as PostLikedEvent;
  }

  static from(json: any): PostLikedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostLikedEvent;
  }
}

export class PostUnlikedEvent extends PostEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string): PostUnlikedEvent {
    return PostEvent.createEvent(EvtPostUnliked, payload, senderId) as PostUnlikedEvent;
  }

  static from(json: any): PostUnlikedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostUnlikedEvent;
  }
}

export class PostCommentedEvent extends PostEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string): PostCommentedEvent {
    return PostEvent.createEvent(EvtPostCommented, payload, senderId) as PostCommentedEvent;
  }

  static from(json: any): PostCommentedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostCommentedEvent;
  }
}

export class PostCommentDeletedEvent extends PostEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string): PostCommentDeletedEvent {
    return PostEvent.createEvent(EvtPostCommentDeleted, payload, senderId) as PostCommentDeletedEvent;
  }

  static from(json: any): PostCommentDeletedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostCommentDeletedEvent;
  }
}
