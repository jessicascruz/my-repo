/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PaymentTable } from './components/PaymentDashboard';
import { mockPayments } from './data/mockData';

export default function App() {
  const handleApprove = (id: number) => {
    console.log('Aprovado:', id);
    alert(`Pagamento ${id} aprovado!`);
  };

  const handleReject = (id: number, reason: string) => {
    console.log('Rejeitado:', id, 'Motivo:', reason);
    alert(`Pagamento ${id} rejeitado. Motivo: ${reason}`);
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', fontFamily: 'sans-serif', color: 'text.primary' }}>
      <Box component="main" sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box component="section" sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, border: 1, borderColor: 'grey.200', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: 'grey.100' }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Painel de Pagamentos Manuais Unificado
            </Typography>
          </Box>
          <PaymentTable 
            payments={mockPayments} 
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Box>
      </Box>
    </Box>
  );
}
