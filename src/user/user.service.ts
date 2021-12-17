import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UserService {
  private users: User[] = [];

  constructor(
    private readonly http: HttpService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async insertPost(name: string, email: string, password: string) {
    const newUser = new this.userModel({
      name,
      email,
      password,
    });
    try {
      const result = await newUser.save();
      return result._id as string;
    } catch (error) {
      console.log(`There is a problem`);
    }
  }

  async findOne(condition: any): Promise<User> {
    return this.userModel.findOne(condition);
  }
}
