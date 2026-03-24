import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import { Attachment } from '../../../types/payment';

interface AttachmentModalProps {
  open: boolean;
  onClose: () => void;
  attachments: Attachment[];
}

export function AttachmentModal({ open, onClose, attachments }: AttachmentModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open || attachments.length === 0) return null;

  const currentFile = attachments[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % attachments.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      aria-labelledby="attachment-dialog-title"
      aria-describedby="attachment-dialog-description"
      maxWidth="lg" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: 3, 
          boxShadow: 24, 
          overflow: 'hidden', 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column' 
        } 
      }}
    >
      <DialogTitle id="attachment-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: 1, borderColor: 'grey.100', bgcolor: 'background.paper', m: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AttachFileIcon sx={{ color: 'primary.main' }} />
          <Box id="attachment-dialog-description">
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              {currentFile.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Anexo {currentIndex + 1} de {attachments.length}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, flex: 1, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', '&:hover .nav-btn': { opacity: 1 } }}>
        {attachments.length > 1 && (
          <IconButton
            onClick={handlePrev}
            className="nav-btn"
            sx={{
              position: 'absolute',
              left: 16,
              zIndex: 10,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              color: 'text.primary',
              width: 48,
              height: 48,
              boxShadow: 3,
              transition: 'all 0.2s',
              opacity: 0.7,
              '&:hover': { bgcolor: 'background.paper', opacity: 1 }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          {currentFile.type === 'pdf' ? (
            <Box component="iframe" src={currentFile.url} title="PDF Preview" sx={{ width: '100%', height: '100%', borderRadius: 1, border: 0 }} />
          ) : (
            <Box component="img" src={currentFile.url} alt="Attachment" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1, boxShadow: 3 }} />
          )}
        </Box>
        {attachments.length > 1 && (
          <IconButton
            onClick={handleNext}
            className="nav-btn"
            sx={{
              position: 'absolute',
              right: 16,
              zIndex: 10,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              color: 'text.primary',
              width: 48,
              height: 48,
              boxShadow: 3,
              transition: 'all 0.2s',
              opacity: 0.7,
              '&:hover': { bgcolor: 'background.paper', opacity: 1 }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: 'background.paper', px: 3, py: 1.5, borderTop: 1, borderColor: 'grey.100', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon fontSize="small" />}
          sx={{ color: 'text.secondary', borderColor: 'grey.300', textTransform: 'none', '&:hover': { bgcolor: 'grey.50', borderColor: 'grey.400' } }}
        >
          Baixar Arquivo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
