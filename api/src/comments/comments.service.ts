import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  // Crear comentario en un post
  async create(postId: string, userId: string, dto: CreateCommentDto) {
    // Verificar que el post existe
    const { data: post, error: postError } = await this.supabase
      .from('posts')
      .select('id, group_id')
      .eq('id', postId)
      .single();

    if (postError) throw new ForbiddenException(postError.message);
    if (!post) throw new ForbiddenException('Post no encontrado');

    // Verificar que el usuario sea miembro activo del grupo
    const { data: member } = await this.supabase
      .from('group_members')
      .select('*')
      .eq('group_id', post.group_id)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!member) throw new ForbiddenException('No eres miembro activo de este grupo');

    // Insertar comentario
    const { data: comment, error } = await this.supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: userId,
        content: dto.content,
      })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    return comment;
  }

  // Listar comentarios de un post
  async findByPost(postId: string) {
    const { data, error } = await this.supabase
      .from('post_comments')
      .select(`
        id,
        created_at,
        content,
        author:author_id(id, email, name, picture)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw new ForbiddenException(error.message);

    return data;
  }
}
