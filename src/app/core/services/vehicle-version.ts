import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import {
  VehicleVersionFilters,
  VehicleVersionOption,
  VehicleVersionResponse,
} from '../models/vehicles-version/vehicle-version.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { VehicleVersionRequest } from '../models/vehicles-version/vehicle-version-request.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleVersionService {
  private http = inject(HttpClient);
  private apiUrl = '/api/vehicle-version';

  getAll(filters: VehicleVersionFilters): Observable<PaginatedResponse<VehicleVersionResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleVersionResponse>>(this.apiUrl, { params });
  }

  getOptions(
    filters: Partial<GeneralOptionQuery>,
  ): Observable<{ success: boolean; data: VehicleVersionOption[] }> {
    const params = buildHttpParams(filters);
    return this.http.get<{ success: boolean; data: VehicleVersionOption[] }>(
      '/api/vehicle-versions/options',
      { params },
    );
  }

  getById(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.get<getAllResponse<VehicleVersionResponse>>(`${this.apiUrl}/${id}`);
  }

  create(payload: VehicleVersionRequest): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.post<getAllResponse<VehicleVersionResponse>>(this.apiUrl, payload);
  }

  update(
    id: string,
    payload: VehicleVersionRequest,
  ): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.put<getAllResponse<VehicleVersionResponse>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.delete<getAllResponse<VehicleVersionResponse>>(`${this.apiUrl}/${id}`);
  }
}
