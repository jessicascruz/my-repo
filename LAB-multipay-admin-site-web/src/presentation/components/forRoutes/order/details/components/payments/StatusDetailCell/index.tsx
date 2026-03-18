import { useState } from 'react'
import {
  TableCell,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'

export const StatusDetailCell = ({
  statusDetail,
}: {
  statusDetail?: string
}) => {
  const [open, setOpen] = useState(false)

  if (!statusDetail) return <TableCell>-</TableCell>

  const truncated =
    statusDetail.length > 60 ? statusDetail.slice(0, 60) + '...' : statusDetail

  return (
    <TableCell>
      {truncated}

      {statusDetail.length > 60 && (
        <IconButton size="small" onClick={() => setOpen(true)}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Detalhes do Status
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {statusDetail}
          </Typography>
        </DialogContent>
      </Dialog>
    </TableCell>
  )
}
