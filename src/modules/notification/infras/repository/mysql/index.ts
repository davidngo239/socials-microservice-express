import { INotificationRepository, NotiPaginated } from "@modules/notification/interface";
import { Notification, NotificationAction, NotificationCondition, NotificationUpdateDTO } from "@modules/notification/model";
import prisma from "@shared/components/prisma";
import { PagingDTO } from "@shared/model";

export class MysqlNotificationRepository implements INotificationRepository {
  async insert(data: Notification): Promise<boolean> {
    await prisma.notifications.create({ data });
    return true;
  }

  async update(id: string, dto: NotificationUpdateDTO): Promise<boolean> {
    await prisma.notifications.update({ where: { id }, data: dto });
    return true;
  }

  async get(id: string): Promise<Notification | null> {
    const noti = await prisma.notifications.findUnique({ where: { id } });
    if (!noti) return null;

    return {
      ...noti,
      actorId: noti.actorId ?? "",
      content: noti.content ?? "",
      action: noti.action as NotificationAction,
      isSent: noti.isSent ?? false,
      isRead: noti.isRead ?? false,
    };
  }

  async list(cond: NotificationCondition, paging: PagingDTO): Promise<NotiPaginated> {
    const offset = (paging.page - 1) * paging.limit;
    const count = await prisma.notifications.count({ where: cond });

    const unreadCount = await prisma.notifications.count({ where: { ...cond, isRead: false } });

    const result = await prisma.notifications.findMany({ where: cond, orderBy: { id: "desc" }, skip: offset, take: paging.limit });

    return {
      data: result.map(noti => ({
        ...noti,
        actorId: noti.actorId ?? "",
        content: noti.content ?? "",
        action: noti.action as NotificationAction,
        isSent: noti.isSent ?? false,
        isRead: noti.isRead ?? false,
      })),
      paging,
      total: count,
      unreadCount: unreadCount,
    };
  }

  async readAll(receiverId: string): Promise<boolean> {
    await prisma.notifications.updateMany({ where: { receiverId }, data: { isRead: true } });
    return true;
  }
}