import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VehicleModelOption,
  VehicleModelRequest,
  VehicleModelResponse,
} from '../models/vehicles-model/vehicle-model.model';
import { buildHttpParams } from './build-http-params';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleModelService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = `vehicle-models`;

  getAll(
    filters: Partial<GeneralOptionQuery>,
  ): Observable<PaginatedResponse<VehicleModelResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<VehicleModelResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string): Observable<getAllResponse<VehicleModelResponse>> {
    return this.http.get<getAllResponse<VehicleModelResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: VehicleModelRequest): Observable<getAllResponse<VehicleModelResponse>> {
    return this.http.post<getAllResponse<VehicleModelResponse>>(
      `${this.api}/${this.flag}`,
      payload,
    );
  }

  update(
    id: string,
    payload: VehicleModelRequest,
  ): Observable<getAllResponse<VehicleModelResponse>> {
    return this.http.put<getAllResponse<VehicleModelResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<getAllResponse<VehicleModelResponse>> {
    return this.http.delete<getAllResponse<VehicleModelResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  getOptions(
    filters: Partial<GeneralOptionQuery>,
  ): Observable<getAllResponse<VehicleModelOption[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<VehicleModelOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
