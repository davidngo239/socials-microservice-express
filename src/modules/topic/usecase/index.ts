import { Paginated, PagingDTO } from "@shared/model";
import { AppError } from "@shared/utils/error";
import { v7 } from "uuid";
import { ITopicRepository, ITopicUsecase } from "../interface/interface";
import { ErrTopicNameAlreadyExists, ErrTopicNotFound } from "../model/error";
import { Topic, TopicCondDTO, topicCondDTOSchema, TopicCreationDTO, topicCreationDTOSchema, TopicUpdateDTO } from "../model/topic";

export class TopicUsecase implements ITopicUsecase {
  constructor(private readonly topicRepo: ITopicRepository) { }

  async create(dto: TopicCreationDTO): Promise<string> {
    const data = topicCreationDTOSchema.parse(dto);

    const topicExist = await this.topicRepo.findByCond({ name: data.name });

    if (topicExist) {
      throw AppError.from(ErrTopicNameAlreadyExists, 400);
    }

    const newId = v7();
    const topic: Topic = {
      id: newId,
      name: data.name,
      postCount: 0,
      color: data.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.topicRepo.insert(topic);

    return newId;
  }

  async update(id: string, data: TopicUpdateDTO): Promise<boolean> {
    const topicExist = await this.topicRepo.findById(id);

    if (!topicExist) {
      throw AppError.from(ErrTopicNotFound, 404);
    }

    await this.topicRepo.update(id, data);
    return true;

  }

  async delete(id: string): Promise<boolean> {
    const topic = await this.topicRepo.findById(id);
    if (!topic) {
      throw AppError.from(ErrTopicNotFound, 404);
    }
    await this.topicRepo.delete(id);

   
    return true;
  }

  async list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>> {
    const dto = topicCondDTOSchema.parse(condition);
    return await this.topicRepo.list(dto, paging);
  }
}