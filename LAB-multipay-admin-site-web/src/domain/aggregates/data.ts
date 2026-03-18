import { StatusType } from './status';

export interface Data {
  Id: string;
  Status: StatusType;
  Nome: string;
  Empresa: string;
  Valor: number;
  Referência: string;
  SubReferência: string;
  IDSistema: string;
  'Data Criação': string;
  Link: string;
  'Ver mais': string;
}
