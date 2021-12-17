import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllPost() {
    const posts = await this.postsService.getPosts();
    return posts;
  }

  /*@Get(':id')
  getPost(@Param('id') postId: string) {
    return this.postsService.getSinglePost(postId);
  }*/
  @UseGuards(AuthGuard('jwt'))
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

    let data = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const filterByMonth = (month) => {
      const capitalizeMonth = month.charAt(0).toUpperCase() + month.slice(1);
      const dates = data.filter((post) => {
        const date = new Date(post.date);

        if (months[date.getMonth()] === capitalizeMonth) {
          return post;
        }

        return null;
      });

      if (dates.length === 0)
        return { status: 'error', message: 'cannot filter by month' };

      data = dates;
    };

    //Filtrar por title
    if (req.query.month) {
      options = {
        $or: [{ month: filterByMonth(req.query.month.toString()) }],
      };
    }

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async removePost(@Param('id') postId: string) {
    await this.postsService.deletePost(postId);
    return null;
  }
}
