import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { GeneralOptionQuery } from '../models/generals/general-option-query.model';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import {
  OemCode,
  ProductOemCodeRequest,
  ProductOemCodeResource,
} from '../models/oem-codes/oem-codes.model';
import { ManufacturerOptionsQuery } from '../models/manufactureres/mnufacturer-options-query.model';

@Injectable({
  providedIn: 'root',
})
export class OemCodeService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'product-oem-codes';

  getAll() {
    return this.http.get<PaginatedResponse<ProductOemCodeResource>>(`${this.api}/${this.flag}`);
  }

  getOptions(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<OemCode[]>>(`${this.api}/${this.flag}/options`, {
      params,
    });
  }

  getByProduct(productId: string, filters: ManufacturerOptionsQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<OemCode[]>>(
      `${this.api}/${this.flag}/product/${productId}/options`,
      {
        params,
      },
    );
  }

  getByManufacturer(filters: GeneralOptionQuery) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<OemCode>>(`${this.api}/${this.flag}/by-manufacturer`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<getAllResponse<OemCode>>(`${this.api}/${this.flag}/${id}`);
  }

  create(data: ProductOemCodeRequest) {
    return this.http.post<getAllResponse<ProductOemCodeResource>>(`${this.api}/${this.flag}`, data);
  }

  update(id: string, data: ProductOemCodeRequest) {
    return this.http.put<getAllResponse<ProductOemCodeResource>>(
      `${this.api}/${this.flag}/${id}`,
      data,
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${this.flag}/${id}`);
  }
}
