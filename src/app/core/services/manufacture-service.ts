import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { ManufacturerResponse } from '../models/manufactureres/manufacturer-response.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { ManufacturerOption } from '../models/manufactureres/manufaturer-options.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { GeneralOption } from '../models/generals/general-options-response.model';
import { ManufacturerRequest } from '../models/manufactureres/manufacturer-request.model';

@Injectable({
  providedIn: 'root',
})
export class ManufacturerService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'manufacturer';

  getAll(filters: Partial<GeneralOptionQuery>) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ManufacturerResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<ManufacturerResponse>(`${this.api}/${this.flag}/${id}`);
  }

  getManufacturerByProduct(productId: string) {
    return this.http.get<getAllResponse<ManufacturerOption[]>>(
      `${this.api}/${this.flag}/product/${productId}`,
    );
  }

  createManufacturer(data: ManufacturerRequest) {
    return this.http.post<getAllResponse<ManufacturerResponse>>(`${this.api}/${this.flag}`, data);
  }

  updateManufacturer(id: string, data: ManufacturerRequest) {
    return this.http.put<getAllResponse<ManufacturerResponse>>(
      `${this.api}/${this.flag}/${id}`,
      data,
    );
  }

  deleteManufacturer(id: string) {
    return this.http.delete<getAllResponse<ManufacturerResponse>>(`${this.api}/${this.flag}/${id}`);
  }
}
