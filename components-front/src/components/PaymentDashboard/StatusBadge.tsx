import React from 'react';
import { Chip } from '@mui/material';
import { PaymentStatus } from '../../types/payment';

interface Props {
  status: PaymentStatus;
}

export function StatusBadge({ status }: Props) {
  const getProps = () => {
    switch (status) {
      case 'PENDENTE':
        return { bgcolor: '#fef9c3', color: '#854d0e' }; // yellow-100, yellow-800
      case 'APROVADO':
        return { bgcolor: '#dcfce7', color: '#166534' }; // green-100, green-800
      case 'RECUSADO':
        return { bgcolor: '#fee2e2', color: '#991b1b' }; // red-100, red-800
      default:
        return { bgcolor: '#f3f4f6', color: '#374151' };
    }
  };

  const colors = getProps();

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: colors.bgcolor,
        color: colors.color,
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.05em',
        height: '22px',
        borderRadius: '12px',
        border: 'none',
        '& .MuiChip-label': {
          px: 1.5,
        },
      }}
    />
  );
}
