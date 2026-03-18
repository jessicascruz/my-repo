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

const DateStartFilter = ({ dateStart, handleChange, dateEnd }: Props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'pt-br'}>
      <DatePicker
        sx={{
          mt: 1,
          width: '100%',
        }}
        data-testid="date-start-filter"
        value={dateStart ? moment.utc(dateStart, 'DD/MM/YYYY') : null}
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
        onChange={value => {
          if (!value) {
            handleChange('start', null)

            return
          }

          const newStartDate = value.toDate()

          handleChange('start', newStartDate)

          if (!dateEnd || dateEnd?.getTime() < newStartDate.getTime()) {
            const newEndDate = value.toDate()
            newEndDate.setDate(newStartDate?.getDate() + 1)

            handleChange('end', newEndDate)
          }
        }}
      />
    </LocalizationProvider>
  )
}

export default DateStartFilter
