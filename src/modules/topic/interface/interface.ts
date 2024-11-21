import { Paginated, PagingDTO } from "@shared/model";
import { Topic, TopicCondDTO, TopicCreationDTO, TopicUpdateDTO } from "../model/topic";
export interface ITopicRepository extends ITopicCommandRepository, ITopicQueryRepository {
    increateTopicPostCount(id: string, field : string, step: number): Promise<boolean>
    decreaseTopicPostCount(id: string, field : string, step: number): Promise<boolean>
}

export interface ITopicUsecase {
  create(data: TopicCreationDTO): Promise<string>;
  update(id: string, data: TopicUpdateDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>>;
}
export interface ITopicCommandRepository {
  insert(data: Topic): Promise<boolean>;
  update(id: string, data: TopicUpdateDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export interface ITopicQueryRepository {
  findById(id: string): Promise<Topic | null>;
  findByCond(condition: TopicCondDTO): Promise<Topic | null>;
  list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>>;
  findByIds(ids: string[]): Promise<Topic[]>;
}