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
    path: 'catalog/categories',
    loadComponent: () =>
      import('./features/catalog/categories/categories').then((m) => m.CategoriesPageComponent),
  },
  {
    path: 'catalog/manufacturers',
    loadComponent: () =>
      import('./features/catalog/manufacturer/manufacturers').then(
        (m) => m.ManufacturersPageComponent,
      ),
  },
  {
    path: 'catalog/origins',
    loadComponent: () =>
      import('./features/catalog/part-origin/origins').then((m) => m.OriginsPageComponent),
  },
  {
    path: 'compatibility/oem-codes',
    loadComponent: () =>
      import('./features/catalog/oem-code/oem-codes').then((m) => m.OemCodesPageComponent),
  },
  {
    path: 'compatibility/:sub',
    loadComponent: () => import('./features/placeholder').then((m) => m.PlaceholderPageComponent),
  },
  {
    path: 'vehicles/brands',
    loadComponent: () =>
      import('./features/vehicles/vehicle-brands/vehicle-brands').then(
        (m) => m.VehicleBrandsPageComponent,
      ),
  },
  {
    path: 'vehicles/models',
    loadComponent: () =>
      import('./features/vehicles/vehicle-models/vehicle-models').then(
        (m) => m.VehicleModelsPageComponent,
      ),
  },
  {
    path: 'vehicles/versions',
    loadComponent: () =>
      import('./features/vehicles/vehicle-versions/vehicle-versions').then(
        (m) => m.VehicleVersionsPageComponent,
      ),
  },
  {
    path: 'vehicles/engines',
    loadComponent: () =>
      import('./features/vehicles/vehicle-engines/vehicle-engines').then(
        (m) => m.VehicleEnginesPageComponent,
      ),
  },
  {
    path: 'vehicles/applications',
    loadComponent: () =>
      import('./features/vehicles/vehicle-applications/vehicle-applications').then(
        (m) => m.VehicleApplicationsPageComponent,
      ),
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
