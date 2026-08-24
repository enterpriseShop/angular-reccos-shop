import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { buildHttpParams } from './build-http-params';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { WarehouseOption } from '../models/warehouses/warehouse-options.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { GeneralOption } from '../models/generals/general-options-response.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'warehouses';

  getAll(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<WarehouseOption[]>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
