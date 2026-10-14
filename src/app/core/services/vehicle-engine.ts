import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { environment } from '../../../environments/environment';
import { VehicleEngineRequest } from '../models/vehicles-engine/vehicle-engine-request.model';
import {
  VehicleEngineFilters,
  VehicleEngineResponse,
} from '../models/vehicles-engine/vehicle-engine.model';

import { GeneralOption } from '../models/generals/general-options-response.model';
import { VehicleEngineFilter } from '../models/vehicles-engine/vehicle-engine-filters.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleEngineService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'vehicle-engines';

  getAll(
    filters: Partial<VehicleEngineFilters>,
  ): Observable<PaginatedResponse<VehicleEngineResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleEngineResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.get<getAllResponse<VehicleEngineResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: VehicleEngineRequest): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.post<getAllResponse<VehicleEngineResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleEngineRequest,
  ): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.put<getAllResponse<VehicleEngineResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<VehicleEngineResponse>> {
    return this.http.delete<getAllResponse<VehicleEngineResponse>>(
      `${this.api}/${this.flag}/${id}`,
    );
  }

  getOptions(filters: Partial<VehicleEngineFilter>): Observable<getAllResponse<GeneralOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
