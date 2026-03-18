import { Button, Box, Typography, Modal, IconButton } from '@mui/material'
import { useState } from 'react'
import { IReceipt } from '@/domain/aggregates/order'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';


interface Props {
  attachments: IReceipt[]
  orderId: string
}

export const AttachmentsModal = ({ attachments = [], orderId }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [attachmentIdx, setAttachmentIdx] = useState(0)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setAttachmentIdx(0)
  }

  const currentAttachment = attachments[attachmentIdx]
  const currentUrl = currentAttachment?.documentName || ''
  const isPdf = currentUrl.toLowerCase().includes('.pdf')
  const fileName = currentUrl.split('/').pop() || `Anexo ${attachmentIdx + 1}`
  const fileUrl = `${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${orderId}/${currentAttachment?.manualPaymentId || attachments[0]?.manualPaymentId}/${fileName}`

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="text"
        sx={{ fontWeight: 600, gap: 0.5 }}
        disabled={attachments.length === 0}
      >
        <AttachFileIcon />
        Anexos ({attachments.length})
      </Button>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: {
              lg: '900px',
              md: '80%',
              xs: '95%',
            },
            bgcolor: '#FFF',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3, pb: 2 }}>
            {attachments.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <AttachFileIcon sx={{ color: '#2762e5', fontSize: 20, mt: 0.2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#333', lineHeight: 1.2 }}>
                    {fileName}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#888', fontWeight: 400, mt: 0.5 }}>
                    Anexo {attachmentIdx + 1} de {attachments.length}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Anexos</Typography>
            )}

            <IconButton onClick={handleCloseModal} size="small" sx={{ color: '#999', mt: -0.5, mr: -0.5 }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: 3, pb: 3 }}>
            {attachments.length === 0 ? (
              <Typography sx={{ py: 4, textAlign: 'center' }}>Nenhum anexo disponível.</Typography>
            ) : (
              <>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '500px',
                    bgcolor: '#1A1A1A',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  {attachments.length > 1 && (
                    <>
                      <IconButton
                        onClick={() => setAttachmentIdx((prev) => (prev - 1 + attachments.length) % attachments.length)}
                        sx={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFF',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.25)',
                          },
                          width: 48,
                          height: 48,
                        }}
                      >
                        <KeyboardArrowLeftIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                      <IconButton
                        onClick={() => setAttachmentIdx((prev) => (prev + 1) % attachments.length)}
                        sx={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(8px)',
                          color: '#1A1A1A',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.25)',
                          },
                          width: 48,
                          height: 48,
                        }}
                      >
                        <KeyboardArrowRightIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    </>
                  )}

                  {isPdf ? (
                    <iframe src={`${fileUrl}#navpanes=0&view=FitH&toolbar=0`} title={fileName} style={{ width: '100%', height: '100%', border: 'none' }} />
                  ) : (
                    <img
                      src={fileUrl}
                      alt={fileName}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.backgroundColor = '#1A1A1A';
                        }
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button
                    variant="outlined"
                    href={fileUrl}
                    download={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                    sx={{
                      borderColor: '#E0E0E0',
                      color: '#666',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      '&:hover': { borderColor: '#BDBDBD', bgcolor: '#F9F9F9' }
                    }}
                  >
                    Abrir em nova aba
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal >
    </>
  )
}
