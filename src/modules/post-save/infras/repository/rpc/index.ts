import { ICommentQueryRepository } from "@modules/comment-like/interface";
import { ITopicQueryRPC } from "@modules/post-save/interface";
import { Topic, topicSchema } from "@modules/post-save/model/topic";
import Logger from "@shared/utils/logger";
import axios from "axios";

export class CommentQueryRPC implements ICommentQueryRepository {
  constructor(private readonly commentServiceUrl: string) { }

  async existed(commentId: string): Promise<boolean> {
    // const result = await axios.get(`${this.commentServiceUrl}/comments/${commentId}`);
    // return result.data;


    // TODO: Implement this
    return true;
  }
}

export class TopicQueryRPC implements ITopicQueryRPC {
  constructor(private readonly topicServiceUrl: string) { }

  async findByIds(ids: Array<string>): Promise<Array<Topic>> {
    try {
      const { data } = await axios.post(`${this.topicServiceUrl}/rpc/topics/list-by-ids`, { ids });

      return data.data.map((item: any) => {
        const dataParse = topicSchema.parse(item);

        return {
          id: dataParse.id,
          name: dataParse.name,
          postCount: dataParse.postCount,
          color: dataParse.color,
        } as Topic;
      });
    } catch (error) {
      Logger.error((error as Error).message);
      return [];
    }
  }
}