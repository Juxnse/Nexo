import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // Dar like
  @UseGuards(JwtAuthGuard)
  @Post()
  async like(@Request() req, @Param('postId') postId: string) {
    const userId = req.user.sub;
    return this.likesService.like(postId, userId);
  }

  // Quitar like
  @UseGuards(JwtAuthGuard)
  @Delete()
  async unlike(@Request() req, @Param('postId') postId: string) {
    const userId = req.user.sub;
    return this.likesService.unlike(postId, userId);
  }

  // Contar likes
  @Get()
  async count(@Param('postId') postId: string) {
    return this.likesService.count(postId);
  }
}
