import { GeneralOptionQuery } from '../models/generals/general-option-query.model';

export function createDefaultQuery(): Partial<GeneralOptionQuery> {
  return {
    search: null,
    active: null,
    per_page: null,
    page: null,
    manufacturer_id: null,
  };
}

export function isDefaultQuery(query: Partial<GeneralOptionQuery>): boolean {
  return (
    query.search === null &&
    query.active === null &&
    query.per_page === null &&
    query.page === null &&
    query.manufacturer_id === null
  );
}

export function isSameQuery(
  first: Partial<GeneralOptionQuery>,
  second: Partial<GeneralOptionQuery>,
): boolean {
  return (
    first.search === second.search &&
    first.active === second.active &&
    first.per_page === second.per_page &&
    first.page === second.page &&
    first.manufacturer_id === second.manufacturer_id
  );
}
