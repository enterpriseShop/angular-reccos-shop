import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import {
  ProductEquivalent,
  CreateProductEquivalentDto,
  UpdateProductEquivalentDto,
  ProductEquivalentFilterParams
} from '../models/product-equivalent';

@Injectable({
  providedIn: 'root'
})
export class ProductEquivalentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/product-equivalents';

  getAll(filters?: ProductEquivalentFilterParams): Observable<ApiResponse<ProductEquivalent[]>> {
    let params = new HttpParams();
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    if (filters?.product_id) {
      params = params.set('product_id', filters.product_id);
    }
    if (filters?.equivalent_product_id) {
      params = params.set('equivalent_product_id', filters.equivalent_product_id);
    }
    if (filters?.search) {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<ApiResponse<ProductEquivalent[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<ProductEquivalent>> {
    return this.http.get<ApiResponse<ProductEquivalent>>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateProductEquivalentDto): Observable<ApiResponse<ProductEquivalent>> {
    return this.http.post<ApiResponse<ProductEquivalent>>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateProductEquivalentDto): Observable<ApiResponse<ProductEquivalent>> {
    return this.http.put<ApiResponse<ProductEquivalent>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
