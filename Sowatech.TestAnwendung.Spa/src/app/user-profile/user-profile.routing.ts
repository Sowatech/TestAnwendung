import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserResetPasswordComponent } from './user-reset-password/user-reset-password.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { AuthGuard } from '../auth/auth-guard.service';

const userProfileRoutes: Routes = [
    { path: 'user/reset-password', component: UserResetPasswordComponent },
    { path: 'user/settings', component: UserSettingsComponent },
    {path: 'passwortreset', component: UserResetPasswordComponent }
];

export const userProfileRouting: ModuleWithProviders = RouterModule.forChild(userProfileRoutes);