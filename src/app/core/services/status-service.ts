import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { ProductResponse } from '../models/products/product-response.model';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { StatusOptionsResponse } from '../models/status/status-options.model';

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

  getOptions(module: string, limit: string | null = null) {
    const params = buildHttpParams({
      module: module,
      limit: limit,
    });
    return this.http.get<StatusOptionsResponse>(`${this.api}/${this.flag}/options`, { params });
  }
}
