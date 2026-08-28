import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { buildHttpParams } from './build-http-params';
import { UnitSaleOptionsResponse } from '../models/units-sale/unit-sale.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { GeneralOption } from '../models/generals/general-options-response.model';

@Injectable({ providedIn: 'root' })
export class UnitSaleService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'units';

  getAll() {
    return this.http.get<PaginatedResponse<UnitSaleOptionsResponse>>(`${this.api}/${this.flag}`);
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
