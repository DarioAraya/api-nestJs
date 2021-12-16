import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { Post } from './posts.model';

@Injectable()
export class PostsService {
  private posts: Post[] = [];

  constructor(
    private readonly http: HttpService,
    @InjectModel('Post') private readonly postModel: Model<Post>,
  ) {}

  async insertPost(
    _id: string,
    username: string,
    title: string,
    comment: string,
    date: Date,
    _tags: [],
  ) {
    const newPost = new this.postModel({
      _id,
      username,
      title,
      comment,
      date,
      _tags,
    });
    const result = await newPost.save();
    return result._id as string;
  }

  @Cron('0 * * * *') //Cada una hora se ejecutara este metodo.
  async postData() {
    const response = await this.http
      .get('http://hn.algolia.com/api/v1/search_by_date?query=nodejs')
      .toPromise();
    const allData = response.data.hits;

    for (let i = 0; allData.length > i; i++) {
      const postAllData = allData[i];

      this.insertPost(
        postAllData.objectID,
        postAllData.author,
        postAllData.story_title,
        postAllData.comment_text,
        postAllData.created_at,
        postAllData._tags,
      );
    }
  }

  async getPosts() {
    const posts = await this.postModel.find().exec();
    return posts
      .map((post) => ({
        id: post._id,
        username: post.username,
        title: post.title,
        comment: post.comment,
        date: post.date,
        tags: post._tags,
      }))
      .sort((a, b) => {
        //Script para devolver el post mas reciente.
        if (a.date > b.date) {
          return -1;
        }
        if (a.date < b.date) {
          return 1;
        }
        return 0;
      });
  }

  async getSinglePost(postId: string) {
    const post = await this.findPost(postId);
    return {
      id: post._id,
      username: post.username,
      title: post.title,
      comment: post.comment,
      date: post.date,
      tags: post._tags,
    };
  }

  async deletePost(postId: string) {
    const result = await this.postModel.deleteOne({ _id: postId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Could not find product.');
    }
  }

  private async findPost(_id: string): Promise<Post> {
    let post;
    try {
      post = await this.postModel.findById(_id);
    } catch (error) {
      throw new NotFoundException('Could not find product.');
    }

    if (!post) {
      throw new NotFoundException('Could not find product.');
    }
    return post;
  }
}
