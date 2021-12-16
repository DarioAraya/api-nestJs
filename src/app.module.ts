import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    PostsModule,
    MongooseModule.forRoot(
      'mongodb+srv://Sofia:FrBkVrDuMTg1oaWD@cluster0.psfel.mongodb.net/hackerNews?retryWrites=true&w=majority',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
