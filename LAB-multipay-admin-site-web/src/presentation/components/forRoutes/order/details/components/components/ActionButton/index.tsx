'use client'

import * as React from 'react'
import {
  Button,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { IReceivableResponse } from '@/domain/aggregates/order'
import { CancelOrderModal } from './CancelOrderModal'
import { useCanCancel } from '../../../../../../../hooks/useCanCancel'
import { StatusType } from '@/domain/aggregates/status'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ManualPaymentFormData } from '../ManualPaymentModal/manualPaymentSchema'
import { ManualPaymentModal } from '../ManualPaymentModal'

interface ActionButtonProps {
  order: IReceivableResponse
  onSubmitManualPayment: (data: ManualPaymentFormData) => void
}

export default function ActionButton({
  order,
  onSubmitManualPayment,
}: ActionButtonProps) {
  const session = {
    user: {
      id: 'guest-id',
      name: 'Guest User',
      email: 'guest@example.com',
    },
  }

  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)
  const [showModal, setShowModal] = React.useState(false)

  const [showManualModal, setShowManualModal] = React.useState(false)

  const { canCancelOrder } = useCanCancel()

  const theme = useTheme()
  const isMobile = useMediaQuery('(max-width:700px)')

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setOpen(false)
  }

  const handleCancelOrder = () => {
    setOpen(false)
    setShowModal(true)
  }

  const handleManualPayment = () => {
    setOpen(false)
    setShowManualModal(true)
  }

  return (
    <React.Fragment>
      <Button
        variant="contained"
        ref={anchorRef}
        endIcon={<ArrowDropDownIcon />}
        aria-controls={open ? 'split-button-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
        onClick={handleToggle}
        sx={{
          width: isMobile ? '100%' : 200,
          borderRadius: 2,
          mt: isMobile ? 0 : -1.8,
          mx: isMobile ? 'auto' : 0,
        }}
      >
        Escolha a ação
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{ zIndex: 10 }}
      >
        {({ TransitionProps, placement }: any) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  <MenuItem onClick={handleManualPayment}>
                    Inserir Pagamento Manual
                  </MenuItem>
                  <MenuItem
                    onClick={handleCancelOrder}
                    disabled={
                      !canCancelOrder({
                        orderStatus: order.status as StatusType,
                      })
                    }
                  >
                    Cancelar Ordem
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {showModal && (
        <CancelOrderModal
          orderId={order.id}
          referenceId={order.referenceId}
          subReferenceId={order.subReferenceId}
          requester={{
            id: session?.user?.id!,
            name: session?.user?.name!,
            email: session?.user?.email!,
          }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {showManualModal && (
        <ManualPaymentModal
          onClose={() => setShowManualModal(false)}
          onSubmit={onSubmitManualPayment}
          open={showManualModal}
        />
      )}
    </React.Fragment>
  )
}
