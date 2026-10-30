import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProductCodeDto, UpdateProductCodeDto } from '../models/product-code';
import { ProductCodeResponse } from '../models/compatibility/product-codes/product-codes-response.model';
import { buildHttpParams } from './build-http-params';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { ProductCodeFiltersRequest } from '../models/compatibility/product-codes/product-code-filters.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductCodeService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'product-equivalents';

  getAll(filters: ProductCodeFiltersRequest): Observable<PaginatedResponse<ProductCodeResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ProductCodeResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<ProductCodeResponse>> {
    return this.http.get<getAllResponse<ProductCodeResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: CreateProductCodeDto): Observable<getAllResponse<ProductCodeResponse>> {
    return this.http.post<getAllResponse<ProductCodeResponse>>(`${this.api}/${this.flag}`, payload);
  }

  update(
    id: string,
    payload: UpdateProductCodeDto,
  ): Observable<getAllResponse<ProductCodeResponse>> {
    return this.http.put<getAllResponse<ProductCodeResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.api}/${this.flag}/${id}`);
  }
}
