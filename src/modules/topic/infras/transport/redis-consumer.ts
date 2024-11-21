import { ITopicRepository } from "@modules/topic/interface/interface";
import { RedisClient } from "@shared/components/redis-pubsub/redis";
import { EvtPostCreated, EvtPostDeleted, PostCreatedEvent, PostDeletedEvent } from "@shared/event/topic.evt";


export class RedisTopicConsumer {
  constructor(private readonly repo: ITopicRepository) { }

  async handledPostCreated(evt: PostCreatedEvent) {
    this.repo.increateTopicPostCount(evt.payload.topicId, "postCount", 1);
  }

  async handledPostDeleted(evt: PostDeletedEvent) {
    this.repo.decreaseTopicPostCount(evt.payload.topicId, "postCount", 1);
  }

  subcriber() {
    RedisClient.getInstance().subscribe(EvtPostCreated, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCreatedEvent.from(data);
      this.handledPostCreated(evt);
    });

    RedisClient.getInstance().subscribe(EvtPostDeleted, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostDeletedEvent.from(data);
      this.handledPostDeleted(evt);
    });
  }
}
