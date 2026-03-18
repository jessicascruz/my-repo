import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  IconButton,
} from '@mui/material'
import { GiPaperClip } from 'react-icons/gi'
import { FaUpload, FaXmark } from 'react-icons/fa6'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  manualPaymentSchema,
  ManualPaymentFormData,
} from './manualPaymentSchema'
import { MoneyInput } from './CurrencyInput'

interface ManualPaymentModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ManualPaymentFormData) => void
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManualPaymentFormData>({
    resolver: zodResolver(manualPaymentSchema) as any,
    defaultValues: {
      reason: '',
      amount: 0,
      files: [],
    },
  })

  const selectedFiles = watch('files')

  const submitHandler = (data: ManualPaymentFormData) => {
    onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: 26 }}>
        Inserir Pagamento Manual
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{ fontWeight: 400, mb: 1 }}
          variant="body2"
          color="text.secondary"
        >
          Informe os dados abaixo para a inserção do pagamento manual.
        </Typography>

        {/* Reason */}
        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ mb: 0.5, fontWeight: 500 }}>Motivo</FormLabel>

          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                error={!!errors.reason}
                helperText={errors.reason?.message}
                slotProps={{ formHelperText: { sx: { marginLeft: 0 } } }}
              />
            )}
          />
        </FormControl>

        <MoneyInput
          name={'amount'}
          control={control as any}
          adornment={<p style={{ marginRight: 3 }}>R$</p>}
        />

        <Box
          mt={3}
          p={2}
          border="1px dashed"
          borderColor="divider"
          sx={{ backgroundColor: '#f6f6f6' }}
          borderRadius={1}
        >
          <FormLabel
            sx={{
              mb: 1,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <GiPaperClip
              style={{ transform: 'rotate(135deg)', fontSize: 20 }}
            />
            Envio de evidências (obrigatório)
          </FormLabel>

          <Button
            variant="contained"
            component="label"
            style={{ borderRadius: 5 }}
            sx={{
              backgroundColor: '#fff',
              color: '#3D3D3D',
              fontWeight: 500,
              padding: '6px 20px',
              border: '1px solid',
              borderColor: '#D5D5D5',
              boxShadow: 'none',
              transition: 'background-color 0.2s ease',
              '&:hover': { backgroundColor: '#E8E8E8', boxShadow: 'none' },
              '&:active': { backgroundColor: '#E8E8E8', boxShadow: 'none' },
            }}
          >
            <FaUpload style={{ marginRight: 8 }} size={16}  />
             {selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s) selecionado(s)` : 'Selecionar arquivos'}
            <input
              hidden
              multiple
              type="file"
              accept="application/pdf,image/*"
              onChange={e => {
                const newFiles = e.target.files
                  ? Array.from(e.target.files).filter(
                    file =>
                      file.type === 'application/pdf' ||
                      file.type === 'image/jpeg' ||
                      file.type === 'image/png'
                  )
                  : []

                e.target.value = ''
                
                const currentFiles = selectedFiles || []
                setValue('files', [...currentFiles, ...newFiles], { shouldValidate: true })
              }}
            />
          </Button>

          {selectedFiles && selectedFiles.length > 0 && (
            <Box
              sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}
            >
              {selectedFiles.map((file: File, index: number) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f5f5f5',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#666', display: 'flex', alignItems: 'center' }}
                  >
                   {file.name}
                  </Typography>

                  <IconButton
                    size="small"
                    sx={{ color: '#ff4d4f', padding: '2px' }}
                    onClick={() => {
                      const updatedFiles = selectedFiles.filter(
                        (_: File, i: number) => i !== index
                      )
                      setValue('files', updatedFiles, { shouldValidate: true })
                    }}
                  >
                    <FaXmark size={14} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {errors.files && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              {errors.files.message}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ mb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(submitHandler as any)}
          variant="contained"
          disabled={isSubmitting}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ManualPaymentModal
