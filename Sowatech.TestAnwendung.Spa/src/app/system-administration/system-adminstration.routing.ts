import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { AuthGuard } from '../auth/auth-guard.service';

const systemAdministrationRoutes: Routes = [
    { path: 'system/settings', component: SystemSettingsComponent }
];

export const systemAdministrationRouting: ModuleWithProviders = RouterModule.forChild(systemAdministrationRoutes);