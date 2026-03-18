import { StatusType, StatusTypeLabels } from '@/domain/aggregates/status'
import { Box } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'

interface StatusBadgeProps {
  status: StatusType
}

const StatusBadgeStyled = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 12px',
  borderRadius: '15px',
  fontSize: '14px',
  fontWeight: '600',
  minWidth: '90px',
  height: '28px',
  textTransform: 'capitalize',
})

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const theme = useTheme()
  const statusSx = {
    CREATED: {
      backgroundColor: theme.palette.background.default,
      color: theme.typography.body1.color,
      border: `1px solid ${theme.typography.body1.color}`,
    },
    VIEWED: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.background.paper,
    },
    PENDING: {
      backgroundColor: theme.palette.warning['400'],
      color: theme.palette.background.paper,
    },
    AUTHORIZED: {
      backgroundColor: theme.palette.success['200'],
      color: theme.palette.background.paper,
    },
    CONFIRMED: {
      backgroundColor: theme.palette.success['300'],
      color: theme.palette.background.paper,
    },
    MANUAL_CONFIRMED: {
      backgroundColor: theme.palette.success['300'],
      color: theme.palette.background.paper,
    },
    DETECTION: {
      backgroundColor: '#0050d7',
      color: theme.palette.background.paper,
    },
    RECOVERY: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.background.paper,
    },
    CANCELED: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.background.paper,
    },
    DENIED: {
      backgroundColor: theme.palette.error['300'],
      color: theme.palette.background.paper,
    },
    REFUNDED: {
      backgroundColor: theme.palette.grey['900'],
      color: theme.palette.background.paper,
    },
    EXPIRED: {
      backgroundColor: theme.palette.grey['500'],
      color: theme.palette.background.paper,
    },
    CHARGED_BACK: {
      backgroundColor: '#B64A07',
      color: theme.palette.background.paper,
    },
  } as const

  return (
    <StatusBadgeStyled sx={statusSx[status]}>
      {StatusTypeLabels[status]}
    </StatusBadgeStyled>
  )
}

export default StatusBadge
