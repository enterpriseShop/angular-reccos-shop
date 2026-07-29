import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { ProductResponse } from '../models/products/product-response.model';
import { environment } from '../../../environments/environment';

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
    return this.http.get<ProductResponse>(`${this.api}/${this.flag}/${id}`);
  }
}
