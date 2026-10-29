import { Observable } from 'rxjs';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import {
  CreateProductCodeTypeDto,
  ProductCodeType,
  ProductCodeTypeFilterParams,
  UpdateProductCodeTypeDto,
} from '../models/product-code';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductCodeTypeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/product-code-types';

  getAll(filters?: ProductCodeTypeFilterParams): Observable<getAllResponse<ProductCodeType[]>> {
    let params = new HttpParams();
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    if (filters?.active !== undefined && filters?.active !== '') {
      params = params.set('active', String(filters.active));
    }
    if (filters?.search) {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<getAllResponse<ProductCodeType[]>>(this.apiUrl, { params });
  }

  getActiveTypes(): Observable<getAllResponse<ProductCodeType[]>> {
    return this.http.get<getAllResponse<ProductCodeType[]>>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<getAllResponse<ProductCodeType>> {
    return this.http.get<getAllResponse<ProductCodeType>>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateProductCodeTypeDto): Observable<getAllResponse<ProductCodeType>> {
    return this.http.post<getAllResponse<ProductCodeType>>(this.apiUrl, payload);
  }

  update(
    id: string,
    payload: UpdateProductCodeTypeDto,
  ): Observable<getAllResponse<ProductCodeType>> {
    return this.http.put<getAllResponse<ProductCodeType>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
