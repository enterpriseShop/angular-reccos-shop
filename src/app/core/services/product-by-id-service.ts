import { inject, Injectable } from '@angular/core';
import { Observable, of, shareReplay, tap, finalize, map } from 'rxjs';

import { ProductResponse } from '../models/products/product-response.model';
import { ProductService } from './product-service';

@Injectable({
  providedIn: 'root',
})
export class ProductByIdService {
  private readonly products = new Map<string, ProductResponse>();
  private readonly pending = new Map<string, Observable<ProductResponse>>();

  private readonly productService = inject(ProductService);

  getProduct(id: string): Observable<ProductResponse> {
    const cached = this.products.get(id);
    if (cached) {
      return of(cached);
    }

    const pending = this.pending.get(id);
    if (pending) {
      return pending;
    }

    const request$ = this.productService.getById(id).pipe(
      map((response) => response.data),
      tap((product) => {
        this.products.set(id, product);
      }),
      finalize(() => {
        this.pending.delete(id);
      }),
      shareReplay(1),
    );
    this.pending.set(id, request$);

    return request$;
  }

  removeProduct(id: string): void {
    this.products.delete(id);
    this.pending.delete(id);
  }
}
