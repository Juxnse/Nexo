import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { OtpComponent } from './pages/otp/otp.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// 👇 importa los grupos
import { GroupsComponent } from './pages/groups/groups.component';
import { GroupDetailComponent } from './pages/group-detail/group-detail.component';
import { GroupsCreateComponent } from './pages/groups-create/groups-create.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
      { path: 'otp', component: OtpComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'callback', component: CallbackComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

      // 👇 rutas de grupos
      { path: 'groups', component: GroupsComponent },
      { path: 'groups/create', component: GroupsCreateComponent, canActivate: [authGuard] },
      { path: 'groups/:id', component: GroupDetailComponent },

      { path: '**', redirectTo: '' },
    ],
  },
];
