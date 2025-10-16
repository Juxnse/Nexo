import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostsService, Post } from '../../core/posts.service';
import { MembersService, Member } from '../../core/members.service';
import { GroupsService, Group } from '../../core/groups.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent implements OnInit {
  groupId!: string;
  group?: Group;
  activeTab: 'posts' | 'members' | 'events' = 'posts';

  // POSTS
  posts: Post[] = [];
  newPost = '';
  loadingPosts = false;
  creatingPost = false;

  // MEMBERS
  members: Member[] = [];
  loadingMembers = false;
  joining = false;

  // Usuario actual
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private membersService: MembersService,
    private groupsService: GroupsService,
    private auth: AuthService
  ) {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    if (this.groupId) {
      this.loadGroup();
      this.loadPosts();
      this.loadMembers();
    }

    // Obtener usuario actual
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.currentUserId = res?.user?.id || null;
      },
      error: () => {
        this.currentUserId = null;
      },
    });
  }

  setTab(tab: 'posts' | 'members' | 'events') {
    this.activeTab = tab;
    if (tab === 'posts') {
      this.loadPosts();
    }
    if (tab === 'members') {
      this.loadMembers();
    }
  }

  // ---- GROUP ----
  loadGroup() {
    this.groupsService.getGroupById(this.groupId).subscribe({
      next: (g) => (this.group = g),
      error: (err) => console.error(err),
    });
  }

  // ---- POSTS ----
  loadPosts() {
    this.loadingPosts = true;
    this.postsService.getPosts(this.groupId).subscribe({
      next: (data) => {
        this.posts = data;
        this.loadingPosts = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingPosts = false;
      },
    });
  }

  createPost() {
    if (!this.newPost.trim()) return;
    this.creatingPost = true;
    this.postsService.createPost(this.groupId, this.newPost).subscribe({
      next: (post) => {
        this.posts.unshift(post);
        this.newPost = '';
        this.creatingPost = false;
      },
      error: (err) => {
        console.error(err);
        this.creatingPost = false;
      },
    });
  }

  // ---- MEMBERS ----
  loadMembers() {
    this.loadingMembers = true;
    this.membersService.getMembers(this.groupId).subscribe({
      next: (data) => {
        this.members = data;
        this.loadingMembers = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMembers = false;
      },
    });
  }

  joinGroup() {
    this.joining = true;
    this.membersService.joinGroup(this.groupId).subscribe({
      next: () => {
        this.joining = false;
        this.loadMembers();
      },
      error: (err) => {
        console.error(err);
        this.joining = false;
      },
    });
  }

  // Verificar si el usuario ya es miembro activo
  isMemberActive(): boolean {
    if (!this.currentUserId) return false;
    return this.members.some(
      (m) => m.user.id === this.currentUserId && m.status === 'active'
    );
  }
}
