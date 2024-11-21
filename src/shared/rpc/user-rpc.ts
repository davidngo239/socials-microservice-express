import { IAuthorRpc } from '@shared/interface';
import { PublicUser } from '@shared/model';
import Logger from '@shared/utils/logger';
import axios from 'axios';

export class UserRPCClient implements IAuthorRpc {
  constructor(private readonly userServiceUrl: string) { }

  async findById(id: string): Promise<PublicUser | null> {
    try {
      const { data } = await axios.get(`${this.userServiceUrl}/rpc/users/${id}`);
      const user = data.data;
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      } as PublicUser;
    } catch (error) {
      Logger.error((error as Error).message);
      return null;
    }
  }

  async findByIds(ids: Array<string>): Promise<Array<PublicUser>> {
    const { data } = await axios.post(`${this.userServiceUrl}/rpc/users/list-by-ids`, { ids });

    const users = data.data.map((user: any) => {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar
      } as PublicUser;
    });
    return users;
  }
}
