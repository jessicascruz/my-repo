import React from 'react'
import { Box, Grid2, TextField, Typography } from '@mui/material'
import { IBusinessPartnerResponse } from '@/domain/aggregates/order'

// Estilos campos
const fieldStyles = {
  backgroundColor: '#F6F6F6',
  color: '#5D5D5D',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    backgroundColor: '#F6F6F6',
    color: '#5D5D5D',
  },
}

interface Props {
  data: IBusinessPartnerResponse
}

const CustomerForm = ({ data }: Props) => {
  return (
    <Box sx={{ mt: 0 }}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Nome</Typography>
          <TextField
            fullWidth
            value={data.name}
            inputProps={{ 'data-testid': `input-name` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>CNPJ/CPF</Typography>
          <TextField
            fullWidth
            value={data.documentNumber}
            inputProps={{ 'data-testid': `input-documentNumber` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>E-mail</Typography>
          <TextField
            fullWidth
            value={data.email}
            inputProps={{ 'data-testid': `input-email` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Telefone</Typography>
          <TextField
            fullWidth
            value={data.phoneNumber}
            inputProps={{ 'data-testid': `input-phoneNumber` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>CEP</Typography>
          <TextField
            fullWidth
            value={data.address.postalCode}
            inputProps={{ 'data-testid': `input-postalCode` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
          <Typography fontWeight={600}>Logradouro</Typography>
          <TextField
            fullWidth
            value={data.address.street}
            inputProps={{ 'data-testid': `input-street` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Número</Typography>
          <TextField
            fullWidth
            value={data.address.number}
            inputProps={{ 'data-testid': `input-number` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Cidade</Typography>
          <TextField
            fullWidth
            value={data.address.city}
            inputProps={{ 'data-testid': `input-city` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Estado</Typography>
          <TextField
            fullWidth
            value={data.address.state}
            inputProps={{ 'data-testid': `input-state` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Bairro</Typography>
          <TextField
            fullWidth
            value={data.address.neighborhood}
            inputProps={{ 'data-testid': `input-neighborhood` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography fontWeight={600}>Complemento</Typography>
          <TextField
            fullWidth
            value={data.address.complement}
            inputProps={{ 'data-testid': `input-complement` }}
            InputProps={{
              readOnly: true,
              sx: fieldStyles,
            }}
          />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <Box borderTop={1} borderColor={'#E0E0E0'} width="100%" mt={2} pt={2}>
            <Grid2 mt={2} container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography fontWeight={600}>E-mail de cobrança</Typography>
                <TextField
                  fullWidth
                  value={data.billingEmail || ''}
                  inputProps={{ 'data-testid': `input-billingEmail` }}
                  InputProps={{
                    readOnly: true,
                    sx: fieldStyles,
                  }}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography fontWeight={600}>Telefone de cobrança</Typography>
                <TextField
                  fullWidth
                  value={data.billingPhoneNumber || ''}
                  inputProps={{ 'data-testid': `input-billingPhoneNumber` }}
                  InputProps={{
                    readOnly: true,
                    sx: fieldStyles,
                  }}
                />
              </Grid2>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  )
}

export default CustomerForm
