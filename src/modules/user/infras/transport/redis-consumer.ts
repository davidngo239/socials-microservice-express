import { IUserCommandRepository } from "@modules/user/interface";
import { RedisClient } from "@shared/components/redis-pubsub/redis";
import { EvtFollowed, EvtUnfollowed, FollowedEvent, UnfollowedEvent } from "@shared/event/follow.evt";
import { EvtPostCreated, EvtPostDeleted, PostCreatedEvent, PostDeletedEvent } from "@shared/event/topic.evt";

export class RedisUserConsumer {
  constructor(
    private readonly repository: IUserCommandRepository
  ) { }

  async handleUserFollowed(evt: FollowedEvent) {
    this.repository.incrementCount(evt.payload.followingId, "followerCount", 1);
  }

  async handleUserUnfollowed(evt: UnfollowedEvent) {
    this.repository.decrementCount(evt.payload.followingId, "followerCount", 1);
  }

  async handleUserPostCreated(evt: PostCreatedEvent) {
    this.repository.incrementCount(evt.payload.userId, "postCount", 1);
  }

  async handleUserPostDeleted(evt: PostDeletedEvent) {
    this.repository.decrementCount(evt.payload.userId, "postCount", 1);
  }

  subscribe() {
    RedisClient.getInstance().subscribe(EvtFollowed, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = FollowedEvent.from(data);
      this.handleUserFollowed(evt);
    });

    RedisClient.getInstance().subscribe(EvtUnfollowed, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = UnfollowedEvent.from(data);
      this.handleUserUnfollowed(evt);
    });

    RedisClient.getInstance().subscribe(EvtPostCreated, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCreatedEvent.from(data);
      this.handleUserPostCreated(evt);
    });

    RedisClient.getInstance().subscribe(EvtPostDeleted, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostDeletedEvent.from(data);
      this.handleUserPostDeleted(evt);
    });

  }
}

