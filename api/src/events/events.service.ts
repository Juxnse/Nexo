import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreateEventDto } from './dto/create-event.dto';

type RsvpStatus = 'going' | 'interested' | 'not_going';

@Injectable()
export class EventsService {
  private async getEventOrThrow(eventId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (error || !data) throw new NotFoundException('Evento no encontrado');
    return data as { id: string; capacity: number | null; status: string | null };
  }

  private async countGoing(eventId: string) {
    const { count, error } = await supabase
      .from('event_rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'going');
    if (error) throw new BadRequestException(error.message);
    return count ?? 0;
  }

  // ---------- NUEVO: Listar todos los eventos públicos ----------
  async findAllPublic() {
    const { data, error } = await supabase
      .from('events')
      .select('*, groups(name)')
      .order('start_at', { ascending: true })
      .limit(10);

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ---------- Listar eventos de un grupo ----------
  async findAll(groupId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('group_id', groupId)
      .order('start_at', { ascending: true });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ---------- Crear evento ----------
  async create(groupId: string, dto: CreateEventDto, userId: string) {
    const payload = {
      ...dto,
      group_id: groupId,
      host_id: userId,
      status: dto.status ?? 'scheduled',
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ---------- Listar RSVPs ----------
  async listRsvps(eventId: string) {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('id, created_at, status, user_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ---------- RSVP ----------
  async rsvp(eventId: string, userId: string, status: RsvpStatus) {
    const event = await this.getEventOrThrow(eventId);

    if (status === 'going' && event.capacity != null) {
      const goingCount = await this.countGoing(eventId);
      if (goingCount >= event.capacity)
        throw new ConflictException('Capacidad del evento alcanzada');
    }

    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert([{ event_id: eventId, user_id: userId, status }], {
        onConflict: 'event_id,user_id',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async removeRsvp(eventId: string, userId: string) {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }
}
