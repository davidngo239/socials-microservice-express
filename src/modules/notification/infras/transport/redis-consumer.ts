import { INotificationUseCase } from "@modules/notification/interface";
import { NotificationAction, NotificationCreateDTO } from "@modules/notification/model";
import { RedisClient } from "@shared/components/redis-pubsub/redis";
import { EvtFollowed, FollowedEvent } from "@shared/event/follow.evt";
import { EvtPostCommented, EvtPostLiked, PostCommentedEvent, PostLikedEvent } from "@shared/event/post.evt";
import { IPostRpc, IPublicUserRpc } from "@shared/interface";

export class RedisNotificationConsumer {
  constructor(
    private readonly useCase: INotificationUseCase,
    private readonly userPublicUseRPC: IPublicUserRpc,
    private readonly postRPC: IPostRpc,
  ) { }

  async handlePostLiked(evt: PostLikedEvent) {
    const { postId } = evt.payload;
    const actorId = evt.senderId!;

    const post = await this.postRPC.findById(postId);
    if (!post) { return; }

    if (actorId === post.authorId) return;

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    const dto: NotificationCreateDTO = {
      receiverId: post.authorId,
      actorId,
      content: `${actor.firstName} ${actor.lastName} liked your post`,
      action: NotificationAction.LIKED,
    };

    await this.useCase.create(dto);
  }

  async handleFollowed(evt: FollowedEvent) {
    const { followingId } = evt.payload;
    const actorId = evt.senderId!;

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    const dto: NotificationCreateDTO = {
      receiverId: followingId,
      actorId,
      content: `${actor.firstName} ${actor.lastName} followed you`,
      action: NotificationAction.FOLLOWED,
    };

    await this.useCase.create(dto);
  };

  async handlePostCommented(evt: PostCommentedEvent) {
    const { postId, authorIdOfParentComment } = evt.payload;
    const actorId = evt.senderId!;

    if (!authorIdOfParentComment) return; // do nothing if it's not a replied comment

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    if (actorId === authorIdOfParentComment) return;

    const dto: NotificationCreateDTO = {
      receiverId: authorIdOfParentComment,
      actorId,
      content: `${actor.firstName} ${actor.lastName} replied to your comment`,
      action: NotificationAction.REPLIED,
    };

    await this.useCase.create(dto);
  }

  subscribe() {
    RedisClient.getInstance().subscribe(EvtFollowed, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = FollowedEvent.from(data);
      this.handleFollowed(evt);
    });

    RedisClient.getInstance().subscribe(EvtPostLiked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostLikedEvent.from(data);
      this.handlePostLiked(evt);
    });

    RedisClient.getInstance().subscribe(EvtPostCommented, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCommentedEvent.from(data);
      this.handlePostCommented(evt);
    });
  }
}