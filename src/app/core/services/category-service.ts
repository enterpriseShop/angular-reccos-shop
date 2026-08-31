import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import {
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../models/catetories/categories.model';
import { buildHttpParams } from './build-http-params';
import { CategoryOption } from '../models/catetories/category-options.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { CategoryDefaultQuery } from '../models/catetories/categories-default-query';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'category';

  getAll(filters: CategoryDefaultQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<CategoryResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<CategoryOption[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<CategoryResponse>(`${this.api}/${this.flag}/${id}`);
  }

  create(data: CreateCategoryPayload) {
    return this.http.post<getAllResponse<CategoryResponse>>(`${this.api}/${this.flag}`, data);
  }

  update(id: string, data: UpdateCategoryPayload) {
    return this.http.put<getAllResponse<CategoryResponse>>(`${this.api}/${this.flag}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete<getAllResponse<CategoryResponse>>(`${this.api}/${this.flag}/${id}`);
  }
}
