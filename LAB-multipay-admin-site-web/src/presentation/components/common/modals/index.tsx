import {
  Box,
  IconButton,
  Modal as MuiModal,
  SxProps,
  TypeText,
  Typography,
  TypographyPropsColorOverrides,
} from '@mui/material'
import { ReactNode } from 'react'
import Close from '@mui/icons-material/Close'
import { OverridableStringUnion } from '@mui/types'

interface Props {
  isOpen?: boolean
  onClose: VoidFunction
  title: string
  titleColor?: OverridableStringUnion<
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | `text${Capitalize<keyof TypeText>}`,
    TypographyPropsColorOverrides
  >
  disableCloseButton?: boolean
  children?: ReactNode | ReactNode[]
  sx?: SxProps
}

export const DefaultModal = ({
  isOpen,
  onClose,
  title,
  disableCloseButton,
  children,
  titleColor,
  sx,
}: Props) => {
  return (
    <MuiModal open={!!isOpen} onClose={onClose}>
      <Box
        sx={{
          width: {
            md: '480px',
            xs: '100%',
          },
          position: 'absolute',
          top: '50%',
          left: '50%',
          borderRadius: '8px',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#FFF',
          padding: 2,
          outline: 'none',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            color={titleColor || 'primary'}
            sx={{ fontSize: 18, fontWeight: 600 }}
          >
            {title}
          </Typography>
          <IconButton
            color="primary"
            size="small"
            disabled={disableCloseButton}
            onClick={onClose}
          >
            <Close />
          </IconButton>
        </Box>

        {children}
      </Box>
    </MuiModal>
  )
}
