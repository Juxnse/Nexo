import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './protected.controller';
import { GroupsModule } from './groups/groups.module'; // 👈 nuevo
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PostsModule,
    LikesModule,
    CommentsModule,

    // Rate limiting: máx. 10 requests/min por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60, // ventana de tiempo (segundos)
        limit: 10, // máximo requests por IP en esa ventana
      },
    ]),

    // Módulos propios
    AuthModule,
    GroupsModule, // 👈 agregado para comunidades
  ],
  controllers: [AppController, ProtectedController],
  providers: [
    AppService,

    // Validación global de DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // solo permite props definidas en DTOs
        forbidNonWhitelisted: true, // rechaza props desconocidas
        transform: true, // convierte tipos automáticamente (ej: string->number)
      }),
    },

    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
