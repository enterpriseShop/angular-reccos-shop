import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildHttpParams } from './build-http-params';
import {
  VehicleBrandPayloadRequest,
  VehicleBrandResponse,
} from '../models/vehicles-brands/vehicle-brand-response.model';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { environment } from '../../../environments/environment';
import { SelectOption } from '../models/design-system/select-option.model';
import { VehicleBrandFiltersRequest } from '../models/vehicles-brands/vehicle-brand-filters.model';

export interface VehicleBrandFilters {
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  active?: boolean | string;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleBrandService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'vehicle-brands';

  getAll(
    filters: Partial<GeneralOptionQuery>,
  ): Observable<PaginatedResponse<VehicleBrandResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleBrandResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<VehicleBrandResponse>> {
    return this.http.get<getAllResponse<VehicleBrandResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: VehicleBrandPayloadRequest): Observable<getAllResponse<VehicleBrandResponse>> {
    return this.http.post<getAllResponse<VehicleBrandResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleBrandPayloadRequest,
  ): Observable<getAllResponse<VehicleBrandResponse>> {
    return this.http.put<getAllResponse<VehicleBrandResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<VehicleBrandResponse>> {
    return this.http.delete<getAllResponse<VehicleBrandResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  getOptions(
    filters: Partial<VehicleBrandFiltersRequest>,
  ): Observable<getAllResponse<SelectOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<SelectOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
