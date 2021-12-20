import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

class MyParams {
  @ApiPropertyOptional()
  page: string;
  @ApiPropertyOptional()
  user: string;
  @ApiPropertyOptional()
  tags: string;
  @ApiPropertyOptional()
  title: string;
  @ApiPropertyOptional()
  month: string;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  /*
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
  }*/

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOkResponse({ description: 'Show all the posts' })
  @ApiBearerAuth()
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
  @ApiOkResponse({
    description:
      'Show all the posts paginated, also can be filter by user, tags, title and month word(Filter by month only work with the five elements on the page) ',
  })
  @ApiBearerAuth()
  async search(@Req() req: Request, @Query() params: MyParams) {
    let options = {};

    //Filter by user
    if (req.query.user) {
      options = {
        $or: [{ username: new RegExp(req.query.user.toString(), 'i') }],
      };
    }

    //Filter by tag
    if (req.query.tags) {
      options = {
        $or: [{ _tags: new RegExp(req.query.tags.toString(), 'i') }],
      };
    }

    //Filter by title
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

    //Filter by month
    if (req.query.month) {
      options = {
        $or: [{ month: filterByMonth(req.query.month.toString()) }],
      };
    }

    data.sort((a, b) => {
      //Script to return the most recent post.
      if (a.date > b.date) {
        return -1;
      }
      if (a.date < b.date) {
        return 1;
      }
      return 0;
    });
    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOkResponse({ description: 'Delete a post' })
  @ApiBearerAuth()
  async removePost(@Param('id') postId: string) {
    await this.postsService.deletePost(postId);
    const message = `The post was deleted`;
    return message;
  }
}
