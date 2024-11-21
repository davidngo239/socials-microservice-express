import { jwtProvider } from '@shared/components/jwt';
import { IRepository, Requester, TokenPayload, UserRole } from '@shared/interface';
import { Paginated, PagingDTO } from '@shared/model';
import { AppError, ErrNotFound } from '@shared/utils/error';
import bcrypt from 'bcrypt';
import { v7 } from 'uuid';
import { IUserUseCase } from '../interface';
import { Status, User, UserCondDTO, userCondDTOSchema, UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserUpdateDTO, userUpdateDTOSchema, userUpdateProfileDTOSchema } from '../model';
import { ErrInvalidToken, ErrInvalidUsernameAndPassword, ErrUserInactivated, ErrUsernameExisted } from '../model/error';

export class UserUseCase implements IUserUseCase {
  constructor(private readonly repository: IRepository<User, UserCondDTO, UserUpdateDTO>) { }

  async profile(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw ErrNotFound;
    }

    return user;
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    const payload = await jwtProvider.verifyToken(token);

    if (!payload) {
      throw ErrInvalidToken;
    }

    const user = await this.repository.findById(payload.sub);
    if (!user) {
      throw ErrNotFound;
    }

    if (user.status === Status.DELETED || user.status === Status.INACTIVE || user.status === Status.BANNED) {
      throw ErrUserInactivated;
    }

    return { sub: user.id, role: user.role };
  }

  async login(data: UserLoginDTO): Promise<string> {
    const dto = userLoginDTOSchema.parse(data);

    // 1. Find user with username from DTO
    const user = await this.repository.findByCond({ username: dto.username });
    if (!user) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog('Username not found');
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(`${dto.password}.${user.salt}`, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog('Password is incorrect');
    }

    if (user.status === Status.DELETED || user.status === Status.INACTIVE) {
      throw AppError.from(ErrUserInactivated, 400);
    }

    // 3. Return token
    const role = user.role;
    const token = jwtProvider.generateToken({ sub: user.id, role });
    return token;
  }

  async register(data: UserRegistrationDTO): Promise<string> {
    const dto = userRegistrationDTOSchema.parse(data);

    // 1. Check username existed
    const existedUser = await this.repository.findByCond({ username: dto.username });
    if (existedUser) {
      throw ErrUsernameExisted;
    }

    // 2. Gen salt and hash password
    // const salt = generateRandomString(20);
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${dto.password}.${salt}`, 10);

    // 3. Create new user
    const newId = v7();
    const newUser: User = {
      ...dto,
      password: hashPassword,
      id: newId,
      status: Status.ACTIVE,
      salt: salt,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      followerCount: 0,
      postCount: 0,
    };

    // 4. Insert new user to database
    await this.repository.insert(newUser);

    return newId;
  }

  async create(data: UserRegistrationDTO): Promise<string> {
    return await this.register(data);
  }

  async getDetail(id: string): Promise<User | null> {
    const data = await this.repository.findById(id);

    if (!data || data.status === Status.DELETED) {
      throw ErrNotFound;
    }

    return data;
  }

  async updateProfile(requester: Requester, data: UserUpdateDTO): Promise<boolean> {
    const dto = userUpdateProfileDTOSchema.parse(data);

    const user = await this.repository.findById(requester.sub);
    if (!user || user.status === Status.DELETED || user.status === Status.BANNED) {
      throw ErrNotFound;
    }

    if (dto.password) {
      const salt = bcrypt.genSaltSync(8);
      const hashPassword = await bcrypt.hash(`${dto.password}.${salt}`, 10);
      dto.salt = salt;
      dto.password = hashPassword;
    }

    await this.repository.update(requester.sub, dto);

    return true;
  }

  async update(id: string, data: UserUpdateDTO): Promise<boolean> {
    const dto = userUpdateDTOSchema.parse(data);

    const user = await this.repository.findById(id);
    if (!user || user.status === Status.DELETED || user.status === Status.BANNED) {
      throw ErrNotFound;
    }

    if (dto.password) {
      const salt = bcrypt.genSaltSync(8);
      const hashPassword = await bcrypt.hash(`${dto.password}.${salt}`, 10);
      dto.salt = salt;
      dto.password = hashPassword;
    }

    await this.repository.update(id, dto);

    return true;
  }

  async list(cond: UserCondDTO, paging: PagingDTO): Promise<Paginated<User>> {
    const parsedCond = userCondDTOSchema.parse(cond);

    return await this.repository.list(parsedCond, paging);
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.repository.findById(id);

    if (!data || data.status === Status.DELETED) {
      throw ErrNotFound;
    }

    await this.repository.delete(id, false);

    return true;
  }

  async listByIds(ids: string[]): Promise<User[]> {
    const users = await this.repository.listByIds(ids);

    return users.map(user => {
      const { password, salt, ...rest } = user;
      return rest as User;
    });
  }


}
