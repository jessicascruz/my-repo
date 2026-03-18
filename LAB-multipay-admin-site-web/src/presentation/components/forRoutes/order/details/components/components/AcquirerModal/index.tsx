import { IRefundAcquirer } from '@/domain/aggregates/order'
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
  acquirer: IRefundAcquirer
}

export const AcquirerModal = ({ acquirer }: Props) => {
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
        <PermIdentity /> {acquirer.description}
      </Button>

      <DefaultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Informações da Adquirente"
        sx={{
          width: {
            lg: '720px',
            md: '80%',
            xs: '100%',
          },
        }}
      >
        <Grid2 container spacing={2} sx={{ p: 2 }}>
          <GridInfo label="ID Adquirente" text={String(acquirer.id)} />
          <GridInfo label="Descrição" text={acquirer.description} />
          <GridInfo label="ID Pagamento" text={acquirer.paymentId} />
          <GridInfo label="Status Detalhado" text={acquirer.statusDetail} />
        </Grid2>
      </DefaultModal>
    </>
  )
}
