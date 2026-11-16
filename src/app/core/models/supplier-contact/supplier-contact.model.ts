import { SupplierContactDepartment } from './supplier-contact-depto.model';

export interface SupplierContact {
  id: string;
  supplier_id: string;
  name: string;
  role?: string | null; // Cargo / Função (ex: Gerente de Contas)
  department: SupplierContactDepartment; // Comercial, Financeiro, Logística, Técnico, Outro
  email: string;
  phone?: string | null; // Telefone fixo comercial
  extension?: string | null; // Ramal do telefone fixo
  mobile?: string | null; // Celular comercial (Ajuste identificado)
  has_whatsapp: boolean; // Se celular possui WhatsApp ativo (Ajuste identificado)
  is_primary: boolean; // Indica se é o contato principal ativo do fornecedor
  active: boolean; // Ativo / Inativo
  notes?: string | null; // Observações (ex: horários, canais de atendimento)
  created_at?: string | null;
  updated_at?: string | null;
}

export type CreateSupplierContactPayload = Omit<
  SupplierContact,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateSupplierContactPayload = Partial<CreateSupplierContactPayload>;

export interface SupplierContactFilterRequest {
  search?: string | null;
  department?: SupplierContactDepartment | null;
  active?: boolean | null;
  is_primary?: boolean | null;
}
