import { Requester } from "@shared/interface";
import { Paginated, PagingDTO } from "@shared/model";
import { Notification, NotificationCondition, NotificationCreateDTO, NotificationUpdateDTO } from "../model";

export type NotiPaginated = Paginated<Notification> & {
  unreadCount: number;
};

export interface INotificationRepository {
  insert(data: Notification): Promise<boolean>;
  update(id: string, dto: NotificationUpdateDTO): Promise<boolean>;
  get(id: string): Promise<Notification | null>;
  list(cond: NotificationCondition, paging: PagingDTO): Promise<NotiPaginated>;
  readAll(receiverId: string): Promise<boolean>;
}

export interface INotificationUseCase {
  create(dto: NotificationCreateDTO): Promise<string>;
  list(cond: NotificationCondition, paging: PagingDTO): Promise<Paginated<Notification>>;
  read(id: string, requester: Requester): Promise<boolean>;
  readAll(requester: Requester): Promise<boolean>;
}
