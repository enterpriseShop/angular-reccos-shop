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
import { VehicleGeneralFiltersRequest } from '../models/vehicles-model/vehicle-model-filters.models';
import { ModelInVehicleVersion } from '../models/vehicles-version/vehicle-version-model.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleVersionService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'vehicle-versions';

  getAll(filters: VehicleVersionFilters): Observable<PaginatedResponse<VehicleVersionResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleVersionResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: Partial<VehicleEngineFilter>): Observable<getAllResponse<GeneralOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.get<getAllResponse<VehicleVersionResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  getVersionByModel(filters: Partial<VehicleGeneralFiltersRequest>) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<ModelInVehicleVersion[]>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptionsVersionByModel(filters: Partial<VehicleGeneralFiltersRequest>) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<ModelInVehicleVersion[]>>(
      `${this.api}/${this.flag}/options`,
      {
        params,
      },
    );
  }

  create(payload: VehicleVersionRequest): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.post<getAllResponse<VehicleVersionResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleVersionRequest,
  ): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.put<getAllResponse<VehicleVersionResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<VehicleVersionResponse>> {
    return this.http.delete<getAllResponse<VehicleVersionResponse>>(
      `${this.api}/${this.flag}/${id}`,
    );
  }
}
