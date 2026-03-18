/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  X, 
  Info, 
  Paperclip, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  IconButton, 
  TableCell, 
  TableRow, 
  Tooltip,
  Table,
  TableBody,
  TableHead,
  TableContainer
} from '@mui/material';

// --- Types ---

type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

interface Attachment {
  id: string;
  type: 'pdf' | 'image';
  name: string;
  url: string;
}

interface Payment {
  id: string;
  status: PaymentStatus;
  motivo: string;
  valor: number;
  solicitante: {
    id: string;
    nome: string;
    email: string;
  };
  anexos: Attachment[];
  criadoEm: string;
  aprovacaoEm?: string;
  aprovador?: {
    id: string;
    nome: string;
    email: string;
  };
  motivoAnalise?: string;
}

// --- Mock Data ---

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: '1045',
    status: 'PENDENTE',
    motivo: 'test approval',
    valor: 2.30,
    solicitante: {
      id: '1246',
      nome: 'Jéssica Cruz',
      email: 'jessica.cruz@example.com.br'
    },
    anexos: [
      { id: 'a1', type: 'pdf', name: 'comprovante_reembolso_01.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'a2', type: 'image', name: 'foto_produto_danificado.jpg', url: 'https://picsum.photos/seed/damaged/1200/800' }
    ],
    criadoEm: '16/03/2026 12:17:59'
  },
  {
    id: '1042',
    status: 'APROVADO',
    motivo: 'Reembolso Frete',
    valor: 25.00,
    solicitante: {
      id: '1240',
      nome: 'Admin Financeiro',
      email: 'admin.financeiro@grupo.com.br'
    },
    anexos: [
      { id: 'a3', type: 'pdf', name: 'nota_fiscal_servico.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    criadoEm: '10/03/2026 09:45:12',
    aprovacaoEm: '10/03/2026 10:15:00',
    aprovador: {
      id: '987',
      nome: 'Ricardo Silva',
      email: 'ricardo.silva@empresa.com.br'
    }
  },
  {
    id: '1039',
    status: 'RECUSADO',
    motivo: 'Erro de Cobrança devido a falha no processamento. Documentação incompleta enviada pelo cliente.',
    valor: 112.90,
    solicitante: {
      id: '1230',
      nome: 'Supervisor Vendas',
      email: 'supervisor.vendas@grupo.com.br'
    },
    anexos: [
      { id: 'a4', type: 'image', name: 'print_erro_sistema.png', url: 'https://picsum.photos/seed/error/1200/800' },
      { id: 'a5', type: 'image', name: 'comprovante_bancario.jpg', url: 'https://picsum.photos/seed/bank/1200/800' },
      { id: 'a6', type: 'pdf', name: 'relatorio_divergencia.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    criadoEm: '08/03/2026 14:20:00',
    aprovacaoEm: '08/03/2026 15:00:00',
    aprovador: {
      id: '756',
      nome: 'Amanda Castro',
      email: 'amanda.castro@empresa.com.br'
    },
    motivoAnalise: 'Documentação incompleta enviada pelo cliente. Faltou o comprovante de residência atualizado.'
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  const styles = {
    PENDENTE: 'badge-pending',
    APROVADO: 'badge-approved',
    RECUSADO: 'badge-rejected'
  };
  return (
    <span className={`badge ${styles[status]}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, maxWidth?: string }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-overlay"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`modal-container ${maxWidth}`}
        >
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <X size={20} />
            </IconButton>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  
  // Modal States
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [viewingSolicitante, setViewingSolicitante] = useState<Payment['solicitante'] | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<Payment | null>(null);
  const [viewingAttachments, setViewingAttachments] = useState<Attachment[] | null>(null);
  const [attachmentIdx, setAttachmentIdx] = useState(0);

  // Handlers
  const handleApprove = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'APROVADO', 
      aprovacaoEm: new Date().toLocaleString('pt-BR'),
      aprovador: { id: '1', nome: 'Usuário Atual', email: 'jessica.cruz@grupomultilaser.com.br' }
    } : p));
  };

  const handleReject = () => {
    if (rejectReason.length < 30) return;
    setPayments(prev => prev.map(p => p.id === rejectingId ? { 
      ...p, 
      status: 'RECUSADO', 
      aprovacaoEm: new Date().toLocaleString('pt-BR'),
      aprovador: { id: '1', nome: 'Usuário Atual', email: 'jessica.cruz@grupomultilaser.com.br' },
      motivoAnalise: rejectReason
    } : p));
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">
      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        
        {/* Main Table Section */}
        <section className="table-container">
          <div className="table-header">
            <h1 className="table-title">Painel de Pagamentos Manuais Unificado</h1>
          </div>
          
          <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
            <Table className="data-table">
              <TableHead>
                <TableRow className="data-table-thead">
                  <TableCell className="data-table-th" sx={{ textAlign: 'center', width: 192 }}>Ações</TableCell>
                  <TableCell className="data-table-th">Id</TableCell>
                  <TableCell className="data-table-th">Status</TableCell>
                  <TableCell className="data-table-th">Motivo</TableCell>
                  <TableCell className="data-table-th" sx={{ whiteSpace: 'nowrap' }}>Valor</TableCell>
                  <TableCell className="data-table-th">Solicitante</TableCell>
                  <TableCell className="data-table-th">Anexos</TableCell>
                  <TableCell className="data-table-th">Criado em</TableCell>
                  <TableCell className="data-table-th">Aprovação em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="data-table-tr">
                    <TableCell className="data-table-td" sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        {payment.status === 'PENDENTE' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(payment.id)}
                              className="btn-action btn-approve"
                            >
                              <Check size={12} /><span>Aprovar</span>
                            </button>
                            <button 
                              onClick={() => setRejectingId(payment.id)}
                              className="btn-action btn-reject"
                            >
                              <X size={12} /><span>Rejeitar</span>
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setViewingAnalysis(payment)}
                            className="btn-details"
                          >
                            <Info size={14} />
                            <span>Ver Detalhes</span>
                          </button>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell className="data-table-td" sx={{ color: 'text.secondary' }}>{payment.id}</TableCell>
                    <TableCell className="data-table-td">
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="data-table-td">
                      <Tooltip title={payment.motivo} arrow placement="top">
                        <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                          {payment.motivo}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="data-table-td" sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                      {payment.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="data-table-td" sx={{ whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => setViewingSolicitante(payment.solicitante)}
                        className="text-blue-600 flex items-center gap-2 hover:underline"
                      >
                        <UserCircle size={18} />
                        <span>{payment.solicitante.email}</span>
                      </button>
                    </TableCell>
                    <TableCell className="data-table-td">
                      <button 
                        onClick={() => {
                          setViewingAttachments(payment.anexos);
                          setAttachmentIdx(0);
                        }}
                        className="text-blue-600 flex items-center gap-2 font-medium hover:text-blue-800"
                      >
                        <Paperclip size={16} /> ({payment.anexos.length})
                      </button>
                    </TableCell>
                    <TableCell className="data-table-td" sx={{ color: 'text.secondary' }}>{payment.criadoEm}</TableCell>
                    <TableCell className="data-table-td" sx={{ color: 'text.secondary' }}>
                      {payment.aprovacaoEm || <span className="italic text-xs text-gray-400">Aguardando</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      </main>

      {/* --- Modals --- */}

      {/* Reject Modal */}
      <Modal 
        isOpen={!!rejectingId} 
        onClose={() => { setRejectingId(null); setRejectReason(''); }} 
        title="Rejeitar Pagamento"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Por favor, informe o motivo da rejeição para o solicitante (mínimo 30 caracteres).</p>
          <div>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 text-sm p-3 min-h-[120px] resize-none placeholder:text-gray-400 transition-colors"
              placeholder="Digite aqui o motivo detalhado..."
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className={`text-[11px] flex items-center gap-1 ${rejectReason.length < 30 ? 'text-red-500' : 'text-green-600'}`}>
                <AlertCircle size={12} />
                <span>{rejectReason.length < 30 ? 'O motivo deve ter pelo menos 30 caracteres.' : 'Motivo válido.'}</span>
              </p>
              <span className="text-[10px] text-gray-400">{rejectReason.length} / 30</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              onClick={() => { setRejectingId(null); setRejectReason(''); }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              disabled={rejectReason.length < 30}
              onClick={handleReject}
              className={`px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg transition-all ${rejectReason.length < 30 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-800 shadow-md'}`}
            >
              Confirmar Rejeição
            </button>
          </div>
        </div>
      </Modal>

      {/* Solicitante Modal */}
      <Modal 
        isOpen={!!viewingSolicitante} 
        onClose={() => setViewingSolicitante(null)} 
        title="Informações do Solicitante"
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 uppercase tracking-tight">ID Solicitante</label>
            <p className="text-gray-600 text-base">{viewingSolicitante?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 uppercase tracking-tight">Nome Solicitante</label>
            <p className="text-gray-600 text-base">{viewingSolicitante?.nome}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-1 uppercase tracking-tight">E-mail Solicitante</label>
            <p className="text-gray-600 text-base">{viewingSolicitante?.email}</p>
          </div>
        </div>
        <div className="flex justify-end pt-8">
          <button 
            onClick={() => setViewingSolicitante(null)}
            className="btn-primary"
          >
            Fechar
          </button>
        </div>
      </Modal>

      {/* Analysis Details Modal */}
      <Modal 
        isOpen={!!viewingAnalysis} 
        onClose={() => setViewingAnalysis(null)} 
        title="Detalhes da Análise"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dados do Aprovador</h4>
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Id</p>
                <p className="text-sm font-semibold text-gray-800">{viewingAnalysis?.aprovador?.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Nome</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{viewingAnalysis?.aprovador?.nome}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">E-mail</p>
                <p className="text-xs text-gray-500 truncate">{viewingAnalysis?.aprovador?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</h4>
              {viewingAnalysis && <StatusBadge status={viewingAnalysis.status} />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data de Aprovação</h4>
              <p className="text-sm text-gray-700 font-medium">{viewingAnalysis?.aprovacaoEm}</p>
            </div>
          </div>

          {viewingAnalysis?.status === 'RECUSADO' && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  {viewingAnalysis.motivoAnalise || 'Nenhum motivo informado.'}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-8">
          <button 
            onClick={() => setViewingAnalysis(null)}
            className="btn-primary"
          >
            Fechar
          </button>
        </div>
      </Modal>

      {/* Attachment Modal */}
      <AnimatePresence>
        {viewingAttachments && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingAttachments(null)}
              className="modal-overlay"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <Paperclip className="text-blue-500" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[300px]">
                      {viewingAttachments[attachmentIdx].name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Anexo {attachmentIdx + 1} de {viewingAttachments.length}
                    </p>
                  </div>
                </div>
                <IconButton onClick={() => setViewingAttachments(null)} sx={{ color: 'text.secondary' }}>
                  <X size={24} />
                </IconButton>
              </div>

              <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative group">
                {viewingAttachments.length > 1 && (
                  <>
                    <button 
                      onClick={() => setAttachmentIdx(prev => (prev - 1 + viewingAttachments.length) % viewingAttachments.length)}
                      className="absolute left-4 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setAttachmentIdx(prev => (prev + 1) % viewingAttachments.length)}
                      className="absolute right-4 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                <div className="w-full h-full flex items-center justify-center">
                  {viewingAttachments[attachmentIdx].type === 'pdf' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 rounded-lg border-2 border-dashed border-slate-300">
                      <FileText size={64} className="text-slate-400 mb-4" />
                      <p className="text-slate-600 font-medium">Visualização de PDF</p>
                      <p className="text-slate-400 text-sm mb-6">{viewingAttachments[attachmentIdx].name}</p>
                      <a 
                        href={viewingAttachments[attachmentIdx].url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Download size={18} /> Abrir PDF em nova aba
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={viewingAttachments[attachmentIdx].url} 
                      alt={viewingAttachments[attachmentIdx].name}
                      className="max-w-full max-h-full object-contain rounded shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-center items-center gap-4">
                <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 border border-gray-200 transition-colors">
                  <Download size={16} /> Baixar Arquivo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
