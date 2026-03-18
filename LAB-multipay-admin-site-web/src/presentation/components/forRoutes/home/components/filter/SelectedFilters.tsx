import { Filter } from '@/domain/aggregates/filter/filter'
import { Chip } from '@mui/material'
import React from 'react'
import { Icon } from '@iconify/react'

interface Props {
  label: string
  deleteFieldFn: (key: keyof Filter) => void
  field: keyof Filter
}

const SelectedFilter = ({ label, deleteFieldFn, field }: Props) => {
  return (
    <Chip
      sx={{ mr: 1 }}
      color="primary"
      label={label}
      onDelete={() => deleteFieldFn(field)}
      deleteIcon={<Icon data-testid="close-icon" icon="mingcute:close-fill" style={{ fontSize: '1rem' }} />}
    />
  )
}

export default SelectedFilter
