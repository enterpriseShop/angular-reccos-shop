import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { PartOriginResponse } from '../models/PartOriginResponse.model';
import { buildHttpParams } from './build-http-params';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';

@Injectable({
  providedIn: 'root',
})
export class PartOriginService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'part-origins';

  getAll(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<PartOriginResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }
}
