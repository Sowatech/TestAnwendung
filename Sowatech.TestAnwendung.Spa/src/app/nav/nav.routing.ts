import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavMenuComponent } from './nav-menu.component';

const navRouting: Routes = [
    { path: '', component: NavMenuComponent}
]

export const NavMenuRoutes: ModuleWithProviders = RouterModule.forChild(navRouting);
