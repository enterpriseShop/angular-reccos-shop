import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { environment } from '../../../environments/environment';
import { VehicleVersionRequest } from '../models/vehicles-version/vehicle-version-request.model';
import {
  VehicleEngineFilters,
  VehicleEngineOption,
  VehicleEngineResponse,
} from '../models/vehicles-engine/vehicle-engine.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleEngineService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'engines';

  getAll(
    filters: Partial<VehicleEngineFilters>,
  ): Observable<PaginatedResponse<VehicleEngineResponse>> {
    // const params = buildHttpParams(filters);
    // return this.http.get<PaginatedResponse<VehicleEngineResponse>>(this.api, { params });
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleEngineResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.get<getAllResponse<VehicleEngineResponse>>(`${this.api}/${id}`);
  }

  create(payload: VehicleVersionRequest): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.post<getAllResponse<VehicleEngineResponse>>(this.api, payload);
  }

  update(
    id: string,
    payload: VehicleVersionRequest,
  ): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.put<getAllResponse<VehicleEngineResponse>>(`${this.api}/${id}`, payload);
  }

  delete(id: string): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.delete<getAllResponse<VehicleEngineResponse>>(`${this.api}/${id}`);
  }

  getOptions(
    versionId?: string,
    search?: string,
  ): Observable<{ success: boolean; data: VehicleEngineOption[] }> {
    let params = new HttpParams();
    if (versionId) {
      params = params.set('version_id', versionId);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<{ success: boolean; data: VehicleEngineOption[] }>(
      '/api/vehicle-engines/options',
      { params },
    );
  }
}
