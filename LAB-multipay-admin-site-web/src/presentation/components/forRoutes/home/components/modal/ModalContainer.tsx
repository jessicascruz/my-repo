import { Grid2 as Grid, Modal } from '@mui/material'
import React, { ReactNode } from 'react'
import ModalHeader from './ModalHeader'


interface Props {
  children: ReactNode
  open: boolean
  handleClose: () => void
  title?: string
  maxWidth?: string | number
  minWidth?: string | number
}
const ModalContainer = ({ children, open, handleClose, title, maxWidth, minWidth }: Props) => {
  const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    width: {
      md: '60%',
      sm: '80%',
      xs: '100%',
    },
    borderRadius: '8px',
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid="modal-container"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Grid spacing={2} justifyContent={'start'} container sx={style} maxWidth={maxWidth} minWidth={minWidth}>
        <ModalHeader title={title} handleClose={handleClose} />
        {children}
      </Grid>
    </Modal>
  )
}

export default ModalContainer
