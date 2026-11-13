import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { CreateProductPayload } from '../models/products/product-create.model';
import { UpdateProductPayload } from '../models/products/product-request.model';
import { ProductResponse } from '../models/products/product-response.model';
import { environment } from '../../../environments/environment';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { ProductFilterRequest } from '../models/products/product-filter-request.model';
import { buildHttpParams } from './build-http-params';
import {
  ProductImportPayload,
  ProductImportResponse,
  ProductImportSchemaResponse,
  ProductImportStatusResponse,
} from '../models/products/product-import.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'product';

  getAll(filters: ProductFilterRequest) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<ProductResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<getAllResponse<ProductResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: CreateProductPayload) {
    return this.http.post<getAllResponse<ProductResponse>>(`${this.api}/${this.flag}`, payload);
  }

  // update(id: string, payload: UpdateProductPayload) {
  //   return this.http.patch<ProductResponse>(`${this.api}/${this.flag}/${id}`, payload);
  // }

  update(id: string, payload: UpdateProductPayload) {
    return this.http.patch<getAllResponse<ProductResponse>>(
      `${this.api}/${this.flag}/${id}`,
      payload,
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${this.flag}/${id}`);
  }

  // Importação em massa

  getImportSchema() {
    return this.http.get<ProductImportSchemaResponse>(`${this.api}/${this.flag}/import-schema`);
  }

  importLSXTemplate() {
    return this.http.get(`${this.api}/${this.flag}/import-template`, {
      responseType: 'blob',
    });
  }

  importProducts(payload: ProductImportPayload) {
    return this.http.post<ProductImportResponse>(`${this.api}/${this.flag}/import`, payload);
  }

  getImportStatus(id: string) {
    return this.http.get<ProductImportStatusResponse>(`${this.api}/${this.flag}/import/${id}`);
  }
}
