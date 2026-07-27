import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'catalog/products/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'catalog/products/:id/view',
    renderMode: RenderMode.Server,
  },
  {
    path: 'catalog/products/:id/duplicate',
    renderMode: RenderMode.Server,
  },
  {
    path: 'catalog/products/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'catalog/:sub',
    renderMode: RenderMode.Server,
  },
  {
    path: 'compatibility/:sub',
    renderMode: RenderMode.Server,
  },
  {
    path: 'vehicles/:sub',
    renderMode: RenderMode.Server,
  },
  {
    path: 'commercial/:sub',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
