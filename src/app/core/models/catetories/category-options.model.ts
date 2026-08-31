import { GeneralOption } from '../generals/general-options-response.model';

export interface CategoryOption extends GeneralOption {
  icon: string;
  is_parent: boolean;
  description: string;
}
