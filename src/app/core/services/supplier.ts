import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierFilterRequest } from '../models/suppliers/supplier-filter-request.model';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { SupplierResponse } from '../models/suppliers/supplier-response.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { SupplierOptionsFilterRequest } from '../models/suppliers/supplier-options-filter-request.model';
import { GeneralOption } from '../models/generals/general-options-response.model';
import { SupplierRequest } from '../models/suppliers/supplier-request.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'suppliers';

  getAll(filters: SupplierFilterRequest): Observable<PaginatedResponse<SupplierResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<SupplierResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: SupplierOptionsFilterRequest): Observable<getAllResponse<GeneralOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<SupplierResponse>> {
    return this.http.get<getAllResponse<SupplierResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: SupplierRequest): Observable<getAllResponse<SupplierResponse>> {
    return this.http.post<getAllResponse<SupplierResponse>>(`${this.api}/${this.flag}`, payload);
  }

  update(id: string, payload: SupplierRequest): Observable<getAllResponse<SupplierResponse>> {
    return this.http.put<getAllResponse<SupplierResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<null>> {
    return this.http.delete<getAllResponse<null>>(`${this.api}/${this.flag}/${id}`);
  }
}
