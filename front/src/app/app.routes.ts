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

// 👥 Comunidades
import { GroupsComponent } from './pages/groups/groups.component';
import { GroupDetailComponent } from './pages/group-detail/group-detail.component';
import { GroupsCreateComponent } from './pages/groups-create/groups-create.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // 🌍 Públicas
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
      { path: 'otp', component: OtpComponent },
      { path: 'callback', component: CallbackComponent },

      // 🔐 Privadas
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'groups', component: GroupsComponent, canActivate: [authGuard] },
      { path: 'groups/create', component: GroupsCreateComponent, canActivate: [authGuard] },
      { path: 'groups/:id', component: GroupDetailComponent, canActivate: [authGuard] },

      // 🚨 Fallback
      { path: '**', redirectTo: '' },
    ],
  },
];
