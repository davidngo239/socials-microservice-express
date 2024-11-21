import { IPostRpc } from "@shared/interface";
import { AppError } from "@shared/utils/error";
import { IPostSaveRepository, IPostSaveUseCase } from "../interface";
import { ActionDTO, actionDTOSchema, PostSave } from "../model";
import { ErrPostAlreadySaved, ErrPostHasNotSaved, ErrPostNotFound } from "../model/error";


export class PostSaveUseCase implements IPostSaveUseCase {
  constructor(
    private readonly repository: IPostSaveRepository,
    private readonly postRpc: IPostRpc,
  ) { }
  async save(dto: ActionDTO): Promise<boolean> {
    const data = actionDTOSchema.parse(dto);
    const { postId } = data;

    const existedAction = await this.repository.get(data);

    if (existedAction) {
      throw AppError.from(ErrPostAlreadySaved, 400);
    }

    const existed = await this.postRpc.findById(postId);

    if (!existed) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    const newData: PostSave = { ...data, createdAt: new Date() }
    const result = await this.repository.insert(newData);

    return result
  }

  async unsave(dto: ActionDTO): Promise<boolean> {
    const data = actionDTOSchema.parse(dto);

    const existedAction = await this.repository.get(data);

    if (!existedAction) {
      throw AppError.from(ErrPostHasNotSaved, 400);
    }

    const result = await this.repository.delete(data);

    return result
  }
}
