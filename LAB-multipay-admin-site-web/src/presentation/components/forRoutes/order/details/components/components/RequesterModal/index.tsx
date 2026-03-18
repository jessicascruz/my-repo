import { IRequester } from '@/domain/aggregates/order'
import { Button, Grid2, Typography } from '@mui/material'
import { useState } from 'react'
import PermIdentity from '@mui/icons-material/PermIdentity'
import { DefaultModal } from '@/presentation/components/common/modals'

interface IGridInfoProps {
  label: string
  text: string
}

const GridInfo = ({ label, text }: IGridInfoProps) => {
  return (
    <Grid2 size={{ xs: 12, sm: 6 }}>
      <Typography fontWeight={600} sx={{ marginBottom: 1 }}>
        {label}
      </Typography>
      <Typography>{text}</Typography>
    </Grid2>
  )
}

interface Props {
  requester: IRequester
}

export const RequesterModal = ({ requester }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)

  const handleCloseModal = () => setIsModalOpen(false)

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="text"
        sx={{ fontWeight: 600, gap: 0.25 }}
      >
        <PermIdentity /> {requester.email}
      </Button>

      <DefaultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Informações do Solicitante"
        sx={{
          width: {
            lg: '720px',
            md: '80%',
            xs: '100%',
          },
        }}
      >
        <Grid2 container spacing={2} sx={{ p: 2 }}>
          <GridInfo label="ID Solicitante" text={requester.id} />
          <GridInfo label="Nome Solicitante" text={requester.name} />
          <GridInfo label="E-mail Solicitante" text={requester.email} />
        </Grid2>
      </DefaultModal>
    </>
  )
}
