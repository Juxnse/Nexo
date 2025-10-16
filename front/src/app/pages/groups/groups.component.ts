import { Component, OnInit } from '@angular/core';
import { GroupsService, Group } from '../../core/groups.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule], // 👈 importa RouterModule aquí
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  loading = false;

  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(filters?: any) {
    this.loading = true;
    this.groupsService.getGroups(filters).subscribe({
      next: (res) => {
        this.groups = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
}
