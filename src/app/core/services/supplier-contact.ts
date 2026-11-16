import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { SupplierContactResponse } from '../models/supplier-contact/supplier-contact-response.model';
import { SupplierContactFiltersRequest } from '../models/supplier-contact/supplier-contact-filter-request.model';
import { SupplierContactRequest } from '../models/supplier-contact/supplier-contact-request.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierContactService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'suppliers';

  /**
   * Helper privado para gerar a URL base de contatos de um fornecedor:
   * Ex: ${apiUrl}/suppliers/{supplierId}/contacts
   */
  private getEndpoint(supplierId: string, contactId?: string): string {
    const base = `${this.api}/${this.flag}/${supplierId}/contacts`;
    return contactId ? `${base}/${contactId}` : base;
  }

  /**
   * GET /api/suppliers/{supplierId}/contacts
   */
  getAll(
    supplierId: string,
    filters: SupplierContactFiltersRequest,
  ): Observable<getAllResponse<SupplierContactResponse[]>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<SupplierContactResponse[]>>(this.getEndpoint(supplierId), {
      params,
    });
  }

  /**
   * GET /api/suppliers/{supplierId}/contacts/{contactId}
   */
  getById(
    supplierId: string,
    contactId: string,
  ): Observable<getAllResponse<SupplierContactResponse>> {
    return this.http.get<getAllResponse<SupplierContactResponse>>(
      this.getEndpoint(supplierId, contactId),
    );
  }

  /**
   * POST /api/suppliers/{supplierId}/contacts
   */
  create(
    supplierId: string,
    payload: SupplierContactRequest,
  ): Observable<getAllResponse<SupplierContactResponse>> {
    return this.http.post<getAllResponse<SupplierContactResponse>>(
      this.getEndpoint(supplierId),
      payload,
    );
  }

  /**
   * PATCH /api/suppliers/{supplierId}/contacts/{contactId}
   */
  update(
    supplierId: string,
    contactId: string,
    payload: Partial<SupplierContactRequest>,
  ): Observable<getAllResponse<SupplierContactResponse>> {
    return this.http.patch<getAllResponse<SupplierContactResponse>>(
      this.getEndpoint(supplierId, contactId),
      payload,
    );
  }

  /**
   * PATCH /api/suppliers/{supplierId}/contacts/{contactId}/status
   */
  toggleStatus(
    supplierId: string,
    contactId: string,
    active?: boolean,
  ): Observable<getAllResponse<SupplierContactResponse>> {
    const body = active !== undefined ? { active } : {};
    return this.http.patch<getAllResponse<SupplierContactResponse>>(
      `${this.getEndpoint(supplierId, contactId)}/status`,
      body,
    );
  }

  /**
   * PATCH /api/suppliers/{supplierId}/contacts/{contactId}/primary
   */
  setPrimaryContact(
    supplierId: string,
    contactId: string,
  ): Observable<getAllResponse<SupplierContactResponse>> {
    return this.http.patch<getAllResponse<SupplierContactResponse>>(
      `${this.getEndpoint(supplierId, contactId)}/primary`,
      {},
    );
  }

  /**
   * DELETE /api/suppliers/{supplierId}/contacts/{contactId}
   */
  delete(supplierId: string, contactId: string): Observable<getAllResponse<void>> {
    return this.http.delete<getAllResponse<void>>(this.getEndpoint(supplierId, contactId));
  }
}
