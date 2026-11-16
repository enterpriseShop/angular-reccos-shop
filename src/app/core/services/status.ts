import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatusOption {
  id: string;
  label: string;
  description?: string;
  color?: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private http = inject(HttpClient);
  private apiUrl = '/api/status';

  getOptions(module = 'PRODUCT', limit: number | null = null): Observable<{ success: boolean; data: StatusOption[] }> {
    const url = limit
      ? `${this.apiUrl}/options?module=${module}&limit=${limit}`
      : `${this.apiUrl}/options?module=${module}`;

    return this.http.get<{ success: boolean; data: StatusOption[] }>(url);
  }
}
