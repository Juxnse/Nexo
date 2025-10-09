import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LikesService {
  constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) {}

  // Dar like
  async like(postId: string, userId: string) {
    // Verificar si ya existe
    const { data: existing } = await this.supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await this.supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();

    if (error) throw new ForbiddenException(error.message);

    return data;
  }

  // Quitar like
  async unlike(postId: string, userId: string) {
    const { error } = await this.supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw new ForbiddenException(error.message);

    return { success: true };
  }

  // Contar likes de un post
  async count(postId: string) {
    const { count, error } = await this.supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw new ForbiddenException(error.message);

    return { postId, likes: count ?? 0 };
  }
}
