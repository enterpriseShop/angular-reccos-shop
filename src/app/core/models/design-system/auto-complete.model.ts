import { GeneralOption } from '../generals/general-options-response.model';

export interface AutocompleteOption extends GeneralOption {
  icon: string;
  disabled: boolean;
  description: string;
}
