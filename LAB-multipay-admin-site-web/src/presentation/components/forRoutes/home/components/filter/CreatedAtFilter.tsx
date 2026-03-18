import React from 'react'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import moment from '@/domain/seedWork/utils/momentSetup'

interface Props {
  date?: Date
  handleChange: (field: string, value: Date | null) => void
}

const CreatedAtFilter = ({ date, handleChange }: Props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'pt-br'}>
      <DatePicker
        sx={{
          mt: 1,
          width: '100%',
        }}
        data-testid="created-at-filter"
        label="Data de Criação"
        value={date ? moment.utc(date, 'DD/MM/YYYY') : null}
        format="DD/MM/YYYY"
        slotProps={{ field: { clearable: true } }}
        onChange={value => {
          handleChange('createdAt', value?.toDate() ?? null)
        }}
      />
    </LocalizationProvider>
  )
}

export default CreatedAtFilter
