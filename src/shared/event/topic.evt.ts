import { AppEvent } from "@shared/model/event";

export type PostEventPayload = {
  topicId: string;
  userId: string;
}

export const EvtPostCreated = 'PostCreated';
export const EvtPostDeleted = 'PostDeleted';

export class PostCreatedEvent extends AppEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string) {
    return new PostCreatedEvent(EvtPostCreated, payload, { senderId });
  }

  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostCreatedEvent(eventName, payload, { id, occurredAt, senderId })
  }
};

export class PostDeletedEvent extends AppEvent<PostEventPayload> {
  static create(payload: PostEventPayload, senderId: string) {
    return new PostDeletedEvent(EvtPostDeleted, payload, { senderId });
  }

  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostDeletedEvent(eventName, payload, { id, occurredAt, senderId })
  }
};

