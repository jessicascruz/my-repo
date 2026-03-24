import React from 'react';
import { Chip } from '@mui/material';
import { PaymentStatus } from '../../types/payment';

interface StatusBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getProps = () => {
    switch (status) {
      case 'PENDENTE':
        return { bgcolor: 'warning.light', color: 'warning.dark' };
      case 'APROVADO':
        return { bgcolor: 'success.light', color: 'success.dark' };
      case 'RECUSADO':
        return { bgcolor: 'error.light', color: 'error.dark' };
      default:
        return { bgcolor: 'grey.100', color: 'grey.700' };
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
