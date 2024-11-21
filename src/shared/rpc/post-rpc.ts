import { IPostRpc } from "@shared/interface";
import { Post } from "@shared/model";
import Logger from "@shared/utils/logger";
import axios from "axios";

export class PostRPCClient implements IPostRpc {
  constructor(private readonly postServiceUrl: string) { }
  async findById(id: string): Promise<Post | null> {
    try {
      const { data } = await axios.get(`${this.postServiceUrl}/rpc/posts/${id}`);

      if (data) return data.data;

      return null;
    } catch (error) {
      Logger.error((error as Error).message);
      return null;
    }
  }

  async findByIds(ids: Array<string>): Promise<Array<Post>> {
    try {
      const { data } = await axios.post(`${this.postServiceUrl}/rpc/posts/list-by-ids`, { ids });

      if (data) return data.data;
      
      return [];
    } catch (error) {
      Logger.error((error as Error).message);
      return [];
    }
  }
}
