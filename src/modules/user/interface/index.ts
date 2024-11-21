import { ICommandRepository, IRepository, IUseCase, Requester, TokenPayload } from "@shared/interface";
import { User, UserCondDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO } from "../model";

export interface IUserUseCase extends IUseCase<UserRegistrationDTO, UserUpdateDTO, User, UserCondDTO> {
  login(data: UserLoginDTO): Promise<string>;
  register(data: UserRegistrationDTO): Promise<string>;
  profile(userId: string): Promise<User>;
  updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean>;

  verifyToken(token: string): Promise<TokenPayload>;
  delete(id: string): Promise<boolean>;
  listByIds(ids: string[]): Promise<User[]>;
}

export interface IUserCommandRepository extends ICommandRepository<User, UserUpdateDTO> {
  incrementCount(id: string, field: string, step: number): Promise<boolean>;
  decrementCount(id: string, field: string, step: number): Promise<boolean>;
}
