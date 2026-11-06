import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/pagination/pagination.model';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from './build-http-params';
import { getAllResponse } from '../models/generals/general-responses-list.model';
import { NotificationsFiltersRequest } from '../models/notification/notification-filters-request.model';
import { NotificationResponse } from '../models/notification/notification-response.model';
import { NotificationRequest } from '../models/notification/notification-request.model';
import { NotificationSummaryResponse } from '../models/notification/notification-summary-response.model';
import { Observable } from 'rxjs';
import { NotificationGeneralResponse } from '../models/notification/notification-unread-count-responses.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private flag = 'notifications';

  getAll(filters: NotificationsFiltersRequest) {
    const params = buildHttpParams(filters);
    return this.http.get<PaginatedResponse<NotificationResponse>>(`${this.api}/${this.flag}`, {
      params,
    });
  }

  /**
   * @param filters
   * @returns
   * Endpoint otimizado para o componente do Sino (retorna as mais recentes + o contador global).
   */
  getSummary(filters: { limit: number }): Observable<getAllResponse<NotificationSummaryResponse>> {
    const params = buildHttpParams(filters);
    return this.http.get<getAllResponse<NotificationSummaryResponse>>(
      `${this.api}/${this.flag}/summary`,
      { params },
    );
  }

  getUnreadCount(): Observable<NotificationGeneralResponse> {
    return this.http.get<NotificationGeneralResponse>(`${this.api}/${this.flag}/unread-count`);
  }

  getById(id: string) {
    return this.http.get<NotificationResponse>(`${this.api}/${this.flag}/${id}`);
  }

  /**
   * Marca todas as notificações pendentes do sistema como lidas de uma só vez.
   * @returns
   */
  readAllNotifications() {
    return this.http.post<NotificationResponse>(`${this.api}/${this.flag}/read-all`, {});
  }

  /**
   * Marca uma notificação específica como lida.
   * @param id ID da notificação.
   */
  markAsRead(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.api}/${this.flag}/${id}/read`, {});
  }

  /**
   * Marca uma notificação específica como não lida.
   * @param id ID da notificação.
   */
  markAsUnread(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.api}/${this.flag}/${id}/unread`, {});
  }

  /**
   * Exclui uma notificação da central.
   * @param id ID da notificação.
   */
  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${this.flag}/${id}`);
  }

  /**
   * Cria uma notificação diretamente no banco de dados.
   */
  create(data: NotificationRequest): Observable<getAllResponse<NotificationResponse>> {
    return this.http.post<getAllResponse<NotificationResponse>>(`${this.api}/${this.flag}`, data);
  }

  update(id: string, data: NotificationRequest) {
    return this.http.put<getAllResponse<NotificationResponse>>(
      `${this.api}/${this.flag}/${id}`,
      data,
    );
  }

  delete(id: string) {
    return this.http.delete<getAllResponse<NotificationResponse>>(`${this.api}/${this.flag}/${id}`);
  }
}
