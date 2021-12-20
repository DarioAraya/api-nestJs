import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('API-Reign')
    .setDescription(
      'This API show the recently posted articles about node.js on Hackers New, these can be filter and is paginated.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000')
    .build();

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}
bootstrap();
