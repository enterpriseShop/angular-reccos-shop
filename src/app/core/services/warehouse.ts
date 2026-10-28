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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'warehouse';

  getAll(filters: GeneralOptionQuery): Observable<PaginatedResponse<WarehouseResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<WarehouseResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: GeneralOptionQuery): Observable<getAllResponse<WarehouseOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<WarehouseOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.get<getAllResponse<WarehouseResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: WarehouseRequest): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.post<getAllResponse<WarehouseResponse>>(`${this.api}/${this.flag}`, payload);
  }

  update(id: string, payload: WarehouseRequest): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.put<getAllResponse<WarehouseResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<WarehouseResponse>> {
    return this.http.delete<getAllResponse<WarehouseResponse>>(`${this.api}/${this.flag}/${id}`);
  }
}
