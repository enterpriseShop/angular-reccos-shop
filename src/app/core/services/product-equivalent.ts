import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateProductEquivalentDto,
  UpdateProductEquivalentDto,
} from '../models/product-equivalent';
import { ProductEquivalentResponse } from '../models/compatibility/product-equivalent/product-equivalent-response';
import { ProductEquivalentFilterParams } from '../models/compatibility/product-equivalent/product-equivalent-filters.model';
import { buildHttpParams } from './build-http-params';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';

@Injectable({
  providedIn: 'root',
})
export class ProductEquivalentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/product-equivalents';

  getAll(
    filters: ProductEquivalentFilterParams,
  ): Observable<PaginatedResponse<ProductEquivalentResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ProductEquivalentResponse>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<getAllResponse<ProductEquivalentResponse>> {
    return this.http.get<getAllResponse<ProductEquivalentResponse>>(`${this.apiUrl}/${id}`);
  }

  create(
    payload: CreateProductEquivalentDto,
  ): Observable<getAllResponse<ProductEquivalentResponse>> {
    return this.http.post<getAllResponse<ProductEquivalentResponse>>(this.apiUrl, payload);
  }

  update(
    id: string,
    payload: UpdateProductEquivalentDto,
  ): Observable<getAllResponse<ProductEquivalentResponse>> {
    return this.http.put<getAllResponse<ProductEquivalentResponse>>(
      `${this.apiUrl}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
