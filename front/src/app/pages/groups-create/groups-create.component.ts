import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../../core/groups.service';

@Component({
  selector: 'app-groups-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups-create.component.html',
  styleUrls: ['./groups-create.component.scss'],
})
export class GroupsCreateComponent {
  name = '';
  description = '';
  visibility: 'public' | 'private' = 'public';
  join_policy: 'open' | 'request' | 'invite' = 'open';
  city = '';
  country = '';
  tags = '';

  creating = false;

  constructor(private groupsService: GroupsService, private router: Router) {}

  createGroup() {
    if (!this.name.trim()) return;

    this.creating = true;

    this.groupsService.createGroup({
      name: this.name,
      description: this.description,
      visibility: this.visibility,
      join_policy: this.join_policy,
      city: this.city,
      country: this.country,
      tags: this.tags ? this.tags.split(',').map(t => t.trim()) : [],
    }).subscribe({
      next: (group) => {
        this.creating = false;
        this.router.navigate(['/groups', group.id]);
      },
      error: (err) => {
        console.error(err);
        this.creating = false;
      }
    });
  }
}
