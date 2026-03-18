import { Button, Link, useTheme } from '@mui/material'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

interface RefundButtonProps {
  paymentId: string
}

export const RefundButton = ({ paymentId }: RefundButtonProps) => {
  const { id: orderId } = useParams<{ id: string }>()
  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <Link href="#">
      <Button
        onClick={() =>
          router.replace(
            `/order/${orderId}/details/refund/${paymentId}?${searchParams}`
          )
        }
        variant="contained"
        size="medium"
        sx={{
          boxShadow: 'none',
          borderRadius: '100px',
          fontWeight: 600,
          backgroundColor: theme.palette?.primary.main,
          ':hover': {
            backgroundColor: theme.palette?.primary[200],
          },
        }}
      >
        Estorno
      </Button>
    </Link>
  )
}
