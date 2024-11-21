import { IPublicUserRpc, Requester } from "@shared/interface";
import { Paginated, PagingDTO, PublicUser } from "@shared/model";
import { ErrForbidden, ErrNotFound } from "@shared/utils/error";
import { v7 } from "uuid";
import { INotificationRepository, INotificationUseCase } from "../interface";
import { Notification, NotificationCondition, notificationCondSchema, NotificationCreateDTO, notificationCreateDTOSchema } from "../model";

export class NotificationUseCase implements INotificationUseCase {
  constructor(
    private readonly repository: INotificationRepository,
    private readonly userPublicUseRPC: IPublicUserRpc,
  ) { }

  async create(dto: NotificationCreateDTO): Promise<string> {
    const data = notificationCreateDTOSchema.parse(dto);
    const newId = v7();

    const newData: Notification = {
      ...data,
      id: newId,
      isSent: false,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.insert(newData);
    return newId;
  }

  async read(id: string, requester: Requester): Promise<boolean> {
    const receiverId = requester.sub;

    const noti = await this.repository.get(id);

    if (!noti) throw ErrNotFound;
    if (noti.receiverId !== receiverId) throw ErrForbidden;

    await this.repository.update(id, { isRead: true });

    return true;
  }

  async readAll(requester: Requester): Promise<boolean> {
    const receiverId = requester.sub;
    await this.repository.readAll(receiverId);
    return true;
  }

  async list(cond: NotificationCondition, paging: PagingDTO): Promise<Paginated<Notification>> {
    const condition = notificationCondSchema.parse(cond);

    const result = await this.repository.list(condition, paging);

    const userIds = result.data.map(noti => noti.actorId);
    const users = await this.userPublicUseRPC.findByIds(userIds);

    const userMap = new Map<string, PublicUser>();
    users.forEach(user => userMap.set(user.id, user));

    result.data.forEach(noti => { noti.sender = userMap.get(noti.actorId); });

    return result;
  }
}