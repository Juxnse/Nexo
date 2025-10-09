import {Controller, Post, Get, Body, Query, UseGuards, Request, Patch, Param,} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // Crear un grupo (solo usuarios autenticados)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateGroupDto) {
    const userId = req.user.sub; // viene del JWT
    return this.groupsService.create(userId, dto);
  }

  // Listar grupos (público)
  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('tag') tag?: string,
    @Query('visibility') visibility?: 'public' | 'private',
  ) {
    return this.groupsService.findAll({ city, tag, visibility });
  }
    @UseGuards(JwtAuthGuard)
    @Post(':id/join')
    async join(@Request() req, @Param('id') groupId: string) {
      const userId = req.user.sub;
      return this.groupsService.joinGroup(groupId, userId);
}

// Listar miembros de un grupo
@UseGuards(JwtAuthGuard)
@Get(':id/members')
async getMembers(@Param('id') groupId: string) {
  return this.groupsService.getMembers(groupId);
}

@UseGuards(JwtAuthGuard)
@Patch(':id/members/:userId')
async updateMember(
  @Request() req,
  @Param('id') groupId: string,
  @Param('userId') targetUserId: string,
  @Body() updates: { role?: 'admin' | 'member'; status?: 'active' | 'pending' | 'banned' },
) {
  const actingUserId = req.user.sub;
  return this.groupsService.updateMember(groupId, targetUserId, actingUserId, updates);
}


}
