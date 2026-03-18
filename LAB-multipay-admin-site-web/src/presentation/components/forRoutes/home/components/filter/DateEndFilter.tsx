import React from 'react'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import moment from '@/domain/seedWork/utils/momentSetup'

interface Props {
  dateStart?: Date
  dateEnd?: Date
  handleChange: (field: string, value: Date | null) => void
}

const DateEndFilter = ({ dateStart, dateEnd, handleChange }: Props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'pt-br'}>
      <DatePicker
        data-testid="date-end-filter"
        sx={{
          mt: 1,
          width: '100%',
        }}
        format="DD/MM/YYYY"
        slotProps={{
          field: {
            clearable: true,
            onClear: () => {
              handleChange('start', null)
              handleChange('end', null)
            },
          },
        }}
        minDate={moment.utc(dateStart, 'DD/MM/YYYY')}
        value={dateEnd ? moment.utc(dateEnd, 'DD/MM/YYYY') : null}
        onChange={value => handleChange('end', value?.toDate() ?? null)}
      />
    </LocalizationProvider>
  )
}

export default DateEndFilter
