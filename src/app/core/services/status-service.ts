import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { ProductResponse } from '../models/products/product-response.model';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { GeneralOption } from '../models/generals/general-options-response.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'status';

  getAll() {
    return this.http.get<PaginatedResponse<ProductResponse>>(`${this.api}/${this.flag}`);
  }

  getOptions(module: string, query: GeneralOptionQuery) {
    const params = buildHttpParams({
      ...query,
      module: module,
    });
    return this.http.get<getAllResponse<GeneralOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }
}
