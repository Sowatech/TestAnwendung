import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MasterDataCategoryComponent} from './master-data.component';
import { AuthGuard } from '../auth/auth-guard.service';

const masterDataRoutes: Routes = [
    {path: 'master-data/categories', component: MasterDataCategoryComponent, canActivate: [AuthGuard]},
    { path: 'master-data/categories2', component: MasterDataCategoryComponent, canActivate: [AuthGuard]}
];

export const masterDataRouting: ModuleWithProviders = RouterModule.forChild(masterDataRoutes);