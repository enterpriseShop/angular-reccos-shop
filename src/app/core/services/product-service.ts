import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { CreateProductPayload } from '../models/products/product-create.model';
import { UpdateProductPayload } from '../models/products/product-request.model';
import { ProductResponse } from '../models/products/product-response.model';
import { environment } from '../../../environments/environment';
import { getAllResponse } from '../models/generals/general-responses-list.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'product';

  getAll() {
    return this.http.get<PaginatedResponse<ProductResponse>>(`${this.api}/${this.flag}`);
  }

  getById(id: string) {
    return this.http.get<getAllResponse<ProductResponse>>(`${this.api}/${this.flag}/${id}`);
  }

  create(payload: CreateProductPayload) {
    return this.http.post<ProductResponse>(`${this.api}/${this.flag}`, payload);
  }

  update(id: string, payload: UpdateProductPayload) {
    return this.http.put<ProductResponse>(`${this.api}/${this.flag}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${this.flag}/${id}`);
  }
}
