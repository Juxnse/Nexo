import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('groups/:groupId/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Crear post en un grupo (miembros activos)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() dto: CreatePostDto,
  ) {
    const userId = req.user.sub;
    return this.postsService.create(groupId, userId, dto);
  }

  // Listar posts de un grupo
  @Get()
  async findByGroup(@Param('groupId') groupId: string) {
    return this.postsService.findByGroup(groupId);
  }
}
