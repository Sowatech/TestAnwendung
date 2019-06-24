import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login.component';

const authRoutes: Routes = [
    { path: 'login/:username/:password', component: LoginComponent }
];

export const authRouting: ModuleWithProviders = RouterModule.forChild(authRoutes);
