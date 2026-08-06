import { HttpParams } from '@angular/common/http';

export function buildHttpParams(params: Record<string, any>): HttpParams {
  let httpParams = new HttpParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  });

  return httpParams;
}
