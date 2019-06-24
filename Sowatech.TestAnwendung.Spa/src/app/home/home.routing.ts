import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';

import { HomeComponent } from './home.component';

const homeRoutes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

];

export const homeRouting: ModuleWithProviders = RouterModule.forChild(homeRoutes);