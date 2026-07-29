import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../models/menu-item';

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
}
