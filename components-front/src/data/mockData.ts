import { PaymentRequest, Attachment } from '../types/payment';

export const mockAttachments: Attachment[] = [
  { type: 'pdf', name: 'comprovante_reembolso_01.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { type: 'image', name: 'foto_produto_danificado.jpg', url: 'https://images.unsplash.com/photo-1586769852044-692d6e671f6c?auto=format&fit=crop&q=80&w=1200' },
];

export const mockPayments: PaymentRequest[] = [
  {
    id: 1045,
    status: 'PENDENTE',
    motivo: 'test approval',
    valor: 'R$ 2,30',
    solicitante: { id: '1246', nome: 'Jéssica Cruz', email: 'jessica.cruz@example.com.br' },
    anexos: mockAttachments,
    criadoEm: '16/03/2026 12:17:59',
    aprovacaoEm: 'Aguardando',
  },
  {
    id: 1042,
    status: 'APROVADO',
    motivo: 'Reembolso Frete',
    valor: 'R$ 25,00',
    solicitante: { id: '1240', nome: 'Admin Financeiro', email: 'admin.financeiro@grupo.com.br' },
    anexos: [mockAttachments[0]],
    criadoEm: '10/03/2026 09:45:12',
    aprovacaoEm: '10/03/2026 10:15:00',
    aprovador: { id: '987', nome: 'Ricardo Silva', email: 'ricardo.silva@empresa.com.br' },
  },
  {
    id: 1039,
    status: 'RECUSADO',
    motivo: 'Erro de Cobrança devido a falha no processamento. Documentação incompleta enviada pelo cliente.',
    valor: 'R$ 112,90',
    solicitante: { id: '1230', nome: 'Supervisor Vendas', email: 'supervisor.vendas@grupo.com.br' },
    anexos: mockAttachments,
    criadoEm: '08/03/2026 14:20:00',
    aprovacaoEm: '08/03/2026 15:00:00',
    aprovador: { id: '756', nome: 'Amanda Castro', email: 'amanda.castro@empresa.com.br' },
  },
];
