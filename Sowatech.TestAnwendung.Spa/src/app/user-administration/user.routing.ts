import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserAdministrationComponent } from './user-administration.component';
import { AuthGuard } from '../auth/auth-guard.service';

const useradminRoutes: Routes = [
    { path: 'admin/user-administration', component: UserAdministrationComponent, canActivate: [AuthGuard] },
];

export const useradminRouting: ModuleWithProviders = RouterModule.forChild(useradminRoutes);