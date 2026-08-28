import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'catalog/products',
    loadComponent: () =>
      import('./features/catalog/products/products').then((m) => m.ProductsPageComponent),
  },
  {
    path: 'catalog/products/new',
    loadComponent: () =>
      import('./features/catalog/products/product-create/product-create').then(
        (m) => m.ProductCreateComponent,
      ),
  },
  {
    path: 'catalog/products/:id/edit',
    loadComponent: () =>
      import('./features/catalog/products/product-workspace/product-workspace').then(
        (m) => m.ProductWorkspaceComponent,
      ),
  },
  {
    path: 'catalog/products/:id/view',
    loadComponent: () =>
      import('./features/catalog/products/product-workspace/product-workspace').then(
        (m) => m.ProductWorkspaceComponent,
      ),
  },
  {
    path: 'catalog/products/:id',
    loadComponent: () =>
      import('./features/catalog/products/product-workspace/product-workspace').then(
        (m) => m.ProductWorkspaceComponent,
      ),
  },
  {
    path: 'catalog/:sub',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'compatibility/:sub',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'vehicles/:sub',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'commercial/:sub',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'imports',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'help',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
