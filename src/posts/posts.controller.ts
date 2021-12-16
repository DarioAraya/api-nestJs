import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async addPost(
    @Body('id') postId: string,
    @Body('username') postUsername: string,
    @Body('title') postTitle: string,
    @Body('comment') postcomment: string,
    @Body('date') postDate: Date,
    @Body('tags') postTags: [],
  ) {
    const generatedId = await this.postsService.insertPost(
      postId,
      postUsername,
      postTitle,
      postcomment,
      postDate,
      postTags,
    );
    return { id: generatedId };
  }

  @Get()
  async getAllPost() {
    const posts = await this.postsService.getPosts();
    return posts;
  }

  @Get(':id')
  getPost(@Param('id') postId: string) {
    return this.postsService.getSinglePost(postId);
  }

  @Delete(':id')
  async removePost(@Param('id') postId: string) {
    await this.postsService.deletePost(postId);
    return null;
  }
}
