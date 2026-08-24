import { PaginatedResponse } from '../core/models/pagination/pagination.model';

export const paginationInitialData = <T = unknown>(): PaginatedResponse<T> => ({
  success: true,
  message: '',
  data: [],
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 20,
    to: 1,
    total: 1,
  },
  links: {
    first: '',
    last: '',
    prev: null,
    next: null,
  },
});
