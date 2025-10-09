import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateGroupDto } from './dto/create-group.dto';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

@Injectable()
export class GroupsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  // Crear grupo
  async create(userId: string, dto: CreateGroupDto) {
    const slug =
      slugify(dto.name, { lower: true, strict: true }) +
      '-' +
      uuidv4().slice(0, 8);

    const { data: group, error } = await this.supabase
      .from('groups')
      .insert({
        created_by: userId,
        slug,
        name: dto.name,
        description: dto.description,
        visibility: dto.visibility,
        join_policy: dto.join_policy,
        tags: dto.tags || [],
        city: dto.city,
        country: dto.country,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    // insertar al creador como owner
    const { error: memberError } = await this.supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
      });

    if (memberError) throw new ForbiddenException(memberError.message);

    return group;
  }

  // Listar grupos con filtros opcionales
  async findAll(filters: {
    city?: string;
    tag?: string;
    visibility?: 'public' | 'private';
  }) {
    let query = this.supabase.from('groups').select('*');

    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.visibility) {
      query = query.eq('visibility', filters.visibility);
    }
    if (filters.tag) {
      // buscar si contiene un tag específico en el array
      query = query.contains('tags', [filters.tag]);
    }

    const { data, error } = await query;
    if (error) throw new ForbiddenException(error.message);

    return data;
  }
async joinGroup(groupId: string, userId: string) {
  // Buscar grupo
  const { data: group, error: groupError } = await this.supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError) throw new ForbiddenException(groupError.message);
  if (!group) throw new ForbiddenException('Grupo no encontrado');

  // Verificar si ya existe membresía
  const { data: existingMember } = await this.supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMember) {
    return existingMember; // ya está unido o pendiente
  }

  // Definir status según join_policy
  let status: 'active' | 'pending' = 'pending';

  if (group.join_policy === 'open') {
    status = 'active';
  } else if (group.join_policy === 'invite') {
    throw new ForbiddenException('Solo puedes unirte con invitación');
  }

  // Insertar membresía
  const { data: membership, error: memberError } = await this.supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
      status,
    })
    .select()
    .single();

  if (memberError) throw new ForbiddenException(memberError.message);

  return membership;
}
async updateMember(
  groupId: string,
  targetUserId: string,
  actingUserId: string,
  updates: { role?: 'admin' | 'member'; status?: 'active' | 'pending' | 'banned' },
) {
  // Verificar si el que ejecuta es admin u owner
  const { data: actingMember, error: actingError } = await this.supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', actingUserId)
    .single();

  if (actingError) throw new ForbiddenException(actingError.message);
  if (!actingMember || (actingMember.role !== 'owner' && actingMember.role !== 'admin')) {
    throw new ForbiddenException('No tienes permisos para gestionar miembros');
  }

  // No se puede modificar al owner
  const { data: targetMember, error: targetError } = await this.supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', targetUserId)
    .single();

  if (targetError) throw new ForbiddenException(targetError.message);
  if (!targetMember) throw new ForbiddenException('El miembro no existe en este grupo');
  if (targetMember.role === 'owner') {
    throw new ForbiddenException('No se puede modificar al owner del grupo');
  }

  // Actualizar rol y/o status
  const { data: updated, error: updateError } = await this.supabase
    .from('group_members')
    .update({
      role: updates.role ?? targetMember.role,
      status: updates.status ?? targetMember.status,
    })
    .eq('id', targetMember.id)
    .select()
    .single();

  if (updateError) throw new ForbiddenException(updateError.message);

  return updated;
}
async getMembers(groupId: string) {
  const { data, error } = await this.supabase
    .from('group_members')
    .select(`
      id,
      role,
      status,
      user:users(id, email, name, picture)
    `)
    .eq('group_id', groupId);

  if (error) throw new ForbiddenException(error.message);
  return data;
}

}
