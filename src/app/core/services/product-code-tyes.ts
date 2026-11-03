import { Observable } from 'rxjs';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductCodeTypeResponse } from '../models/compatibility/product-code-type/product-code-type-response.model';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { ProductCodeTypeFiltersRequest } from '../models/compatibility/product-code-type/product-code-types-filters.model';
import { environment } from '../../../environments/environment';
import { ProductCodeTypeRequest } from '../models/compatibility/product-code-type/product-code-type-request.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCodeTypeService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'product-code-types';

  getAll(
    filters: ProductCodeTypeFiltersRequest,
  ): Observable<PaginatedResponse<ProductCodeTypeResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ProductCodeTypeResponse>>(`${this.api}/${this.flag}`, {
      params,
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      }),
    });
  }

  getActiveTypes(): Observable<getAllResponse<ProductCodeTypeResponse[]>> {
    return this.http.get<getAllResponse<ProductCodeTypeResponse[]>>(
      `${this.api}/${this.flag}/active`,
    );
  }

  getById(id: string): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.get<getAllResponse<ProductCodeTypeResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: ProductCodeTypeRequest): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.post<getAllResponse<ProductCodeTypeResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: ProductCodeTypeRequest,
  ): Observable<getAllResponse<ProductCodeTypeResponse>> {
    return this.http.put<getAllResponse<ProductCodeTypeResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.api}/${this.flag}/${id}`);
  }
}
