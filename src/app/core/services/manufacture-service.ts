import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { ManufacturerResponse } from '../models/manufactureres/manufacturer-response.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { ManufacturerOptionsResponse } from '../models/manufactureres/manufaturer-options.model';

@Injectable({
  providedIn: 'root',
})
export class ManufacturerService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'manufacturer';

  getAll() {
    return this.http.get<PaginatedResponse<ManufacturerResponse>>(`${this.api}/${this.flag}`);
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<ManufacturerOptionsResponse>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<ManufacturerResponse>(`${this.api}/${this.flag}/${id}`);
  }
}
