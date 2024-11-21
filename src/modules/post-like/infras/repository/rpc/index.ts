import { IPostQueryRepository } from '@modules/post-like/interface'
import axios from 'axios'

export class PostQueryRPC implements IPostQueryRepository {
 constructor(private readonly postServiceUrl: string) {}

 async existed(postId: string): Promise<boolean> {

  // TODO: uncomment this code when the post service is ready
  
  // const result = await axios.get(`${this.postServiceUrl}/posts/${postId}`)
  // return result.data

  return true
 }
}
