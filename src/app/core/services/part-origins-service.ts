import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { PartOriginResponse } from '../models/part-origin/part-origin-response';
import { buildHttpParams } from './build-http-params';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { PartOriginRequest } from '../models/part-origin/part-origin-request';

@Injectable({
  providedIn: 'root',
})
export class PartOriginService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'part-origins';

  getAll(filters: Partial<GeneralOptionQuery>) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<PartOriginResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<PartOriginResponse>(`${this.api}/${this.flag}/${id}`);
  }

  create(data: PartOriginRequest) {
    return this.http.post<getAllResponse<PartOriginResponse>>(`${this.api}/${this.flag}`, data);
  }

  update(id: string, data: PartOriginRequest) {
    return this.http.put<getAllResponse<PartOriginResponse>>(
      `${this.api}/${this.flag}/${id}`,
      data,
    );
  }

  delete(id: string) {
    return this.http.delete<getAllResponse<PartOriginResponse>>(`${this.api}/${this.flag}/${id}`);
  }
}
