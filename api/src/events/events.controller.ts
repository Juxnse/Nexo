import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { RsvpDto } from './dto/rsvp.dto';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ---------- NUEVO: Obtener todos los eventos públicos ----------
  @Get('events')
  async findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  // ---------- Eventos por grupo ----------
  @Get('groups/:groupId/events')
  async findAll(@Param('groupId', new ParseUUIDPipe()) groupId: string) {
    return this.eventsService.findAll(groupId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('groups/:groupId/events')
  async create(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Body() dto: CreateEventDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.eventsService.create(groupId, dto, userId);
  }

  // ---------- RSVPs ----------
  @Get('events/:eventId/rsvps')
  async listRsvps(@Param('eventId', new ParseUUIDPipe()) eventId: string) {
    return this.eventsService.listRsvps(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/:eventId/rsvp')
  async rsvp(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() dto: RsvpDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.eventsService.rsvp(eventId, userId, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('events/:eventId/rsvp')
  async removeRsvp(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.eventsService.removeRsvp(eventId, userId);
  }
}
