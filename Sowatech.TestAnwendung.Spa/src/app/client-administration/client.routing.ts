import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientListComponent } from './client-list/client-list.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { AuthGuard } from '../auth/auth-guard.service';

const clientRoutes: Routes = [
    {
        path: 'mandanten', component: ClientListComponent, canActivate: [AuthGuard]
        //path: 'mandanten', component: ClientListeComponent, canActivate: [AuthGuard],
        //data: {
        //    navItem: [{ lang: "de", text: "Mandanten", category: "Administration" }, { lang: "en", text: "Clients", category: "Administration" }]
        //}
    },
    { path: 'mandant/:id', component: ClientDetailComponent, canActivate: [AuthGuard]}
];

export const clientRouting: ModuleWithProviders = RouterModule.forChild(clientRoutes);