import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { VehicleModelOption } from '../models/vehicles-model/vehicle-model.model';
import { VehicleVersionOption } from '../models/vehicles-version/vehicle-version.model';
import {
  VehicleApplicationFilters,
  VehicleApplicationRequest,
  VehicleApplicationResponse,
} from '../models/vehicle-application/vehicle-application.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleApplicationService {
  private http = inject(HttpClient);
  private api = '/api/vehicle-application';
  private flag = 'vehicle-application';

  getAll(
    filters: Partial<VehicleApplicationFilters>,
  ): Observable<PaginatedResponse<VehicleApplicationResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleApplicationResponse>>(
      `${this.api}/${this.flag}`,
      { params },
    );
  }

  getById(id: string): Observable<getAllResponse<VehicleApplicationResponse>> {
    return this.http.get<getAllResponse<VehicleApplicationResponse>>(
      `${this.api}/${this.flag}/${id}`,
    );
  }

  create(
    payload: VehicleApplicationRequest,
  ): Observable<getAllResponse<VehicleApplicationResponse>> {
    return this.http.post<getAllResponse<VehicleApplicationResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleApplicationRequest,
  ): Observable<getAllResponse<VehicleApplicationResponse>> {
    return this.http.put<getAllResponse<VehicleApplicationResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<void>> {
    return this.http.delete<getAllResponse<void>>(`${this.api}/${this.flag}/${id}`);
  }

  getModels(brandId?: string): Observable<getAllResponse<VehicleModelOption[]>> {
    let params = new HttpParams();
    if (brandId) {
      params = params.set('brand_id', brandId);
    }
    return this.http.get<getAllResponse<VehicleModelOption[]>>('/api/vehicle-models/options', {
      params,
    });
  }

  getVersions(modelId?: string): Observable<getAllResponse<VehicleVersionOption[]>> {
    let params = new HttpParams();
    if (modelId) {
      params = params.set('model_id', modelId);
    }
    return this.http.get<getAllResponse<VehicleVersionOption[]>>('/api/vehicle-versions/options', {
      params,
    });
  }

  getEngines(): Observable<getAllResponse<VehicleApplicationResponse>> {
    // const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<VehicleApplicationResponse>>(
      '/api/vehicle-engines/options',
    );
  }
}
