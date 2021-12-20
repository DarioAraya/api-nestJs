import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';

import { UserService } from './user.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  //Para registrar un usuario
  /*
  @Post('register')
  async addPost(
    @Body('name') userName: string,
    @Body('email') userEmail: string,
    @Body('password') userPass: string,
  ) {
    const hashedPassword = await bcrypt.hash(userPass, 12);

    const generatedId = await this.userService.insertPost(
      userName,
      userEmail,
      hashedPassword,
    );

    return { id: generatedId };
  }*/

  @Post('login')
  @ApiOkResponse({ description: 'User login to get token' })
  @ApiBody({ type: UserDto })
  async login(
    @Body('email') userEmail: string,
    @Body('password') userPass: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ userEmail });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await bcrypt.compare(userPass, user.password))) {
      throw new BadRequestException('invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    return jwt;
  }
}
