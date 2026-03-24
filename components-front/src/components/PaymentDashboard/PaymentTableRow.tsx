import React from 'react';
import { 
  TableRow, 
  TableCell, 
  Box, 
  Button, 
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { PaymentRequest, User, Attachment } from '../../types/payment';
import { StatusBadge } from './StatusBadge';

interface PaymentTableRowProps {
  payment: PaymentRequest;
  onApprove: (payment: PaymentRequest) => void;
  onReject: (payment: PaymentRequest) => void;
  onDetails: (payment: PaymentRequest) => void;
  onRequester: (user: User) => void;
  onAttachments: (attachments: Attachment[]) => void;
}

export const PaymentTableRow = React.memo(({ 
  payment, 
  onApprove, 
  onReject, 
  onDetails, 
  onRequester, 
  onAttachments 
}: PaymentTableRowProps) => {
  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell align="center">
        {payment.status === 'PENDENTE' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => onApprove(payment)}
              title="Aprovar"
              color="success"
              startIcon={<CheckIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 14 } }} />}
              sx={{
                borderRadius: '50px',
                fontSize: '10px',
                fontWeight: 600,
                boxShadow: 1,
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
              }}
            >
              Aprovar
            </Button>
            <Button
              variant="contained"
              onClick={() => onReject(payment)}
              title="Rejeitar"
              color="error"
              startIcon={<CloseIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 14 } }} />}
              sx={{
                borderRadius: '50px',
                fontSize: '10px',
                fontWeight: 600,
                boxShadow: 1,
                textTransform: 'none',
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
              }}
            >
              Rejeitar
            </Button>
          </Box>
        ) : (
          <Button
            variant="outlined"
            onClick={() => onDetails(payment)}
            startIcon={<InfoOutlinedIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 16 } }} />}
            sx={{
              borderRadius: '50px',
              bgcolor: 'primary.light',
              borderColor: 'primary.main',
              color: 'primary.main',
              fontSize: '10px',
              fontWeight: 'bold',
              px: 2,
              py: 0.5,
              width: '100%',
              whiteSpace: 'nowrap',
              boxShadow: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: 'primary.light', opacity: 0.9 }
            }}
          >
            Ver Detalhes
          </Button>
        )}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary' }}>{payment.id}</TableCell>
      <TableCell>
        <StatusBadge status={payment.status} />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary' }}>
        <Tooltip title={payment.motivo} placement="top" arrow>
          <Box sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'help' }}>
            {payment.motivo}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{payment.valor}</TableCell>
      <TableCell>
        <Button
          variant="text"
          onClick={() => onRequester(payment.solicitante)}
          startIcon={<AccountCircleOutlinedIcon fontSize="small" />}
          sx={{ color: 'primary.main', textTransform: 'none', p: 0, minWidth: 'auto', '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}
        >
          <span>{payment.solicitante.email}</span>
        </Button>
      </TableCell>
      <TableCell align="center">
        <Button
          variant="text"
          onClick={() => onAttachments(payment.anexos)}
          disabled={payment.anexos.length === 0}
          startIcon={<AttachFileIcon fontSize="small" />}
          sx={{ 
            color: 'primary.main', 
            fontWeight: 500, 
            p: 0, 
            minWidth: 'auto', 
            textTransform: 'none',
            '&:hover': { color: 'primary.dark', bgcolor: 'transparent' }, 
            '&.Mui-disabled': { opacity: 0.5, cursor: 'not-allowed' } 
          }}
        >
          ({payment.anexos.length})
        </Button>
      </TableCell>
      <TableCell sx={{ color: 'text.secondary' }}>{payment.criadoEm}</TableCell>
      <TableCell sx={{ 
        color: payment.status === 'PENDENTE' ? 'text.disabled' : 'text.secondary', 
        fontStyle: payment.status === 'PENDENTE' ? 'italic' : 'normal', 
        fontSize: payment.status === 'PENDENTE' ? '0.75rem' : 'inherit' 
      }}>
        {payment.aprovacaoEm || 'Aguardando'}
      </TableCell>
    </TableRow>
  );
});

PaymentTableRow.displayName = 'PaymentTableRow';
