import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientSettingsComponent } from './client-settings/client-settings.component';
import { AuthGuard } from '../auth/auth-guard.service';

const clientProfileRoutes: Routes = [
    { path: 'client/settings', component: ClientSettingsComponent }
];

export const clientProfileRouting: ModuleWithProviders = RouterModule.forChild(clientProfileRoutes);