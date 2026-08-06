import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { WarehouseOptionsResponse } from '../models/warehouses/warehouse-options.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { buildHttpParams } from './build-http-params';

@Injectable({
  providedIn: 'root',
})
export class WarehousesService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'warehouses';

  getAll() {
    return this.http.get<PaginatedResponse<WarehouseOptionsResponse>>(`${this.api}/${this.flag}`);
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<WarehouseOptionsResponse>(`${this.api}/${this.flag}/options`, { params });
  }
}
