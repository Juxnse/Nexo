import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  // Crear un post en un grupo
  async create(groupId: string, userId: string, dto: CreatePostDto) {
    // Verificar que el usuario sea miembro activo
    const { data: member, error: memberError } = await this.supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (memberError) throw new ForbiddenException(memberError.message);
    if (!member) throw new ForbiddenException('No eres miembro activo de este grupo');

    // Insertar post
    const { data: post, error } = await this.supabase
      .from('posts')
      .insert({
        group_id: groupId,
        author_id: userId,
        content: dto.content,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    return post;
  }

  // Listar posts de un grupo
  async findByGroup(groupId: string) {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        id,
        group_id,
        created_at,
        content,
        author:author_id(id, email, name, picture)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw new ForbiddenException(error.message);

    return data;
  }
}
