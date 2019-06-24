import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserGroupComponent } from './user-group.component';
import { AuthGuard } from '../auth/auth-guard.service';

const userGroupRoutes: Routes = [
    { path: 'admin/usergroup', component: UserGroupComponent, canActivate: [AuthGuard] },
];

export const userGroupRouting: ModuleWithProviders = RouterModule.forChild(userGroupRoutes);