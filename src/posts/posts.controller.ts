import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Request } from 'express';

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

  /*@Get(':id')
  getPost(@Param('id') postId: string) {
    return this.postsService.getSinglePost(postId);
  }*/

  @Get('/search')
  async search(@Req() req: Request) {
    let options = {};

    //Filtrar por usuario
    if (req.query.user) {
      options = {
        $or: [{ username: new RegExp(req.query.user.toString(), 'i') }],
      };
    }

    //Filtrar por tags
    if (req.query.tags) {
      options = {
        $or: [{ _tags: new RegExp(req.query.tags.toString(), 'i') }],
      };
    }

    //Filtrar por title
    if (req.query.title) {
      options = {
        $or: [{ title: new RegExp(req.query.title.toString(), 'i') }],
      };
    }

    const query = this.postsService.find(options);

    const page: number = parseInt(req.query.page as any) || 1;
    const limit = 5;
    const total = await this.postsService.count(options);

    const data = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  @Delete(':id')
  async removePost(@Param('id') postId: string) {
    await this.postsService.deletePost(postId);
    return null;
  }
}
