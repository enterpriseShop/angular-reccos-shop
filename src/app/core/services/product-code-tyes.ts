import { Observable } from 'rxjs';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { CreateProductCodeTypeDto, UpdateProductCodeTypeDto } from '../models/product-code';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductCodeTypeResponse } from '../models/compatibility/product-code-type/product-code-type-response.model';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { ProductCodeTypeFiltersRequest } from '../models/compatibility/product-code-type/product-code-types-filters.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCodeTypeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/product-code-types';

  getAll(
    filters: ProductCodeTypeFiltersRequest,
  ): Observable<PaginatedResponse<ProductCodeTypeResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ProductCodeTypeResponse>>(this.apiUrl, { params });
  }

  getActiveTypes(): Observable<getAllResponse<ProductCodeTypeResponse[]>> {
    return this.http.get<getAllResponse<ProductCodeTypeResponse[]>>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.get<getAllResponse<ProductCodeTypeResponse>>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateProductCodeTypeDto): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.post<getAllResponse<ProductCodeTypeResponse>>(this.apiUrl, payload);
  }

  update(
    id: string,
    payload: UpdateProductCodeTypeDto,
  ): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.put<getAllResponse<ProductCodeTypeResponse>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
