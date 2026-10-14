import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import {
  VehicleVersionFilters,
  VehicleVersionResponse,
} from '../models/vehicles-version/vehicle-version.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { VehicleVersionRequest } from '../models/vehicles-version/vehicle-version-request.model';
import { environment } from '../../../environments/environment';
import { VehicleEngineFilter } from '../models/vehicles-engine/vehicle-engine-filters.model';
import { GeneralOption } from '../models/generals/general-options-response.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleVersionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private apiUrl = 'vehicle-versions';

  getAll(filters: VehicleVersionFilters): Observable<PaginatedResponse<VehicleVersionResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleVersionResponse>>(
      `${this.baseUrl}/${this.apiUrl}`,
      { params },
    );
  }

  getOptions(filters: Partial<VehicleEngineFilter>): Observable<getAllResponse<GeneralOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(
      `${this.baseUrl}/${this.apiUrl}/options`,
      { params },
    );
  }

  getById(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.get<getAllResponse<VehicleVersionResponse>>(
      `${this.baseUrl}/${this.apiUrl}/${id}`,
    );
  }

  create(payload: VehicleVersionRequest): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.post<getAllResponse<VehicleVersionResponse>>(
      `${this.baseUrl}/${this.apiUrl}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleVersionRequest,
  ): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.put<getAllResponse<VehicleVersionResponse>>(
      `${this.baseUrl}/${this.apiUrl}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.delete<getAllResponse<VehicleVersionResponse>>(
      `${this.baseUrl}/${this.apiUrl}/${id}`,
    );
  }
}
