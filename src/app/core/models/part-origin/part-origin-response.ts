export interface PartOriginResponse extends Record<string, unknown> {
  id: string;
  name: string;
  active: boolean;
  description: string;
  display_order: number;
}
