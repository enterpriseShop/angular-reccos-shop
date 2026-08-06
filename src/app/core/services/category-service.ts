import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { CategoryResponse } from '../models/catetories/categories.model';
import { buildHttpParams } from './build-http-params';
import { CategoryOptionsResponse } from '../models/catetories/category-options.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'category';

  getAll() {
    return this.http.get<PaginatedResponse<CategoryResponse>>(`${this.api}/${this.flag}`);
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<CategoryOptionsResponse>(`${this.api}/${this.flag}/options`, { params });
  }

  getById(id: string) {
    return this.http.get<CategoryResponse>(`${this.api}/${this.flag}/${id}`);
  }
}
