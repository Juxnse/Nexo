import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Crear comentario
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = req.user.sub;
    return this.commentsService.create(postId, userId, dto);
  }

  // Listar comentarios de un post
  @Get()
  async findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }
}
