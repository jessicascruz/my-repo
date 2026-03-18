export type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface Attachment {
  type: 'pdf' | 'image';
  name: string;
  url: string;
}

export interface PaymentRequest {
  id: number;
  status: PaymentStatus;
  motivo: string;
  valor: string;
  solicitante: User;
  anexos: Attachment[];
  criadoEm: string;
  aprovacaoEm?: string;
  aprovador?: User;
}
