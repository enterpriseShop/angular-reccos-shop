import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { WarehouseResponse } from '../models/warehouses/warehouses.interface';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { WarehouseRequest } from '../models/warehouses/warehouse-request.model';
import { WarehouseOption } from '../models/warehouses/warehouse-options.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private http = inject(HttpClient);
  private apiUrl = '/api/warehouse';

  getAll(filters: GeneralOptionQuery): Observable<PaginatedResponse<WarehouseResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<WarehouseResponse>>(`${this.apiUrl}`, {
      params,
    });
  }

  getOptions(filters: GeneralOptionQuery): Observable<getAllResponse<WarehouseOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<WarehouseOption[]>>(`${this.apiUrl}/options`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.get<getAllResponse<WarehouseResponse>>(`${this.apiUrl}/${id}`);
  }

  create(payload: WarehouseRequest): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.post<getAllResponse<WarehouseResponse>>(this.apiUrl, payload);
  }

  update(id: string, payload: WarehouseRequest): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.put<getAllResponse<WarehouseResponse>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.delete<getAllResponse<WarehouseResponse>>(`${this.apiUrl}/${id}`);
  }
}
