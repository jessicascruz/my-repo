import React, { useEffect, useState } from 'react'
import {
  companyOptions,
  statusOptions,
  systemsOptions,
} from '@/domain/aggregates/options'
import {
  Typography,
  Button,
  Grid2,
  SelectChangeEvent,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Select,
  styled,
  useTheme,
} from '@mui/material'
import { useFilterContext } from '@/presentation/context/filter-context'
import { ClearIcon } from '@mui/x-date-pickers/icons'
import { maskCpfCnpj } from '@/domain/seedWork/utils/maskCpfCnpj'
import CreatedAtFilter from './CreatedAtFilter'
import DateStartFilter from './DateStartFilter'
import DateEndFilter from './DateEndFilter'
import { Filter, FilterPaging } from '@/domain/aggregates/filter/filter'
import { DateRange } from '@/domain/aggregates/filter/dateRange'
import ModalContainer from '../modal/ModalContainer'

interface FormFieldProps {
  label: string
  type: 'text' | 'date' | 'select'
  id: string
  options?: { label: string; value: number | string }[]
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

const ModalButton = styled(Button)({
  boxShadow: 'none',
  borderRadius: '100px',
  fontWeight: 600,
  minWidth: 100,
})

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  id,
  options = [],
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const value = e.target.value
    onChange(value)
  }

  return (
    <>
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{label}</Typography>
      {type === 'select' ? (
        <FormControl fullWidth variant="outlined" margin="dense">
          <InputLabel id={id}>{label}</InputLabel>
          <Select
            labelId={id}
            value={value}
            onChange={handleChange}
            label={label}
            input={
              <OutlinedInput
                label={label}
                endAdornment={
                  value ? (
                    <InputAdornment
                      position="start"
                      sx={{ marginRight: '16px' }}
                    >
                      <IconButton
                        onClick={e => {
                          e.stopPropagation()
                          handleChange({
                            target: { value: '' },
                          } as SelectChangeEvent<string>)
                        }}
                        edge="start"
                        size="small"
                        aria-label="clear"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              />
            }
          >
            {options.map(({ label, value }) => (
              <MenuItem key={label + value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          type={type}
          value={value}
          onChange={handleChange}
          variant="outlined"
          margin="dense"
          disabled={disabled}
          InputLabelProps={{
            shrink: false,
          }}
          InputProps={{
            'aria-label': label,
          }}
        />
      )}
    </>
  )
}

type THomeFilters = Partial<
  Omit<Filter, 'createdAt'> & { start: Date; end: Date; createdAt: Date }
>

const Formulary: React.FC<{
  open: boolean
  handleClose: () => void
}> = ({ open, handleClose }) => {
  const theme = useTheme()
  const { setFilter, filterData } = useFilterContext()
  const [filters, setFilters] = useState<THomeFilters>()

  const handleFilter = ({ createdAt, start, end, ...rest }: THomeFilters) => {
    setFilter({
      ...rest,
      paging: new FilterPaging(
        +filterData?.paging?.page,
        +filterData?.paging?.perPage,
        filterData?.paging?.sort,
        filterData?.paging?.sortCriteria
      ),
      ...(createdAt && {
        createdAt: createdAt?.toISOString().split('T')[0],
      }),
      dateRange:
        start && end
          ? new DateRange(
              start?.toISOString().split('T')[0],
              end?.toISOString().split('T')[0]
            )
          : undefined,
    })

    handleClose()
  }

  useEffect(() => {
    setFilters({
      ...filterData,
      start: filterData.dateRange?.start
        ? new Date(filterData.dateRange?.start)
        : undefined,
      end: filterData.dateRange?.end
        ? new Date(filterData.dateRange?.end)
        : undefined,
      createdAt: filterData.createdAt
        ? new Date(filterData.createdAt)
        : undefined,
    })
  }, [filterData])

  const handleChange = (
    field: string,
    value: string | Date | null,
    mask?: boolean
  ) => {
    setFilters((prevFilter: any) => {
      return {
        ...prevFilter,
        [field]: mask ? maskCpfCnpj(value as string) : value,
      }
    })
  }

  const style = {
    maxHeight: '80vh',
    overflowY: 'auto',
  }

  return filters ? (
    <ModalContainer open={open} handleClose={handleClose} title="Filtros">
      <Grid2 container sx={style} spacing={2}>
        {/* orderId */}
        {/* <Grid2 size={{ xs: 12, md: 6 }}>
                <FormField
                    label="ID"
                    type="text"
                    id="orderId"
                    value={filters.orderId}
                    onChange={value => handleChange('orderId', value)}
                />
            </Grid2> */}

        {/* referenceId */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="Referência"
            type="text"
            id="referenceId"
            value={filters.referenceId}
            onChange={value => handleChange('referenceId', value)}
          />
        </Grid2>

        {/* Status */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="Status"
            type="select"
            id="status"
            value={filters.status}
            options={statusOptions}
            onChange={value => handleChange('status', value)}
          />
        </Grid2>

        {/* company */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <FormField
            label="Empresa"
            type="select"
            id="company"
            value={filters.company}
            options={companyOptions}
            onChange={value => handleChange('company', value)}
          />
        </Grid2>

        {/* createdAt */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            Data de Criação
          </Typography>
          <CreatedAtFilter
            date={filters.createdAt}
            handleChange={handleChange}
          />
        </Grid2>

        {/* createdAt */}
        <Grid2 size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            Data Inicial
          </Typography>
          <DateStartFilter
            dateStart={filters?.start}
            dateEnd={filters?.end}
            handleChange={handleChange}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            Data Final
          </Typography>
          <DateEndFilter
            dateStart={filters?.start}
            dateEnd={filters?.end}
            handleChange={handleChange}
          />
        </Grid2>

        {/* systemId */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="Sistema"
            type="select"
            id="systemId"
            options={systemsOptions}
            value={filters.systemId ? String(filters.systemId) : undefined}
            onChange={value => handleChange('systemId', value)}
          />
        </Grid2>

        {/* businessPartnerId */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="ID do Parceiro"
            type="text"
            id="businessPartnerId"
            value={filters?.businessPartnerId}
            onChange={value => handleChange('businessPartnerId', value)}
          />
        </Grid2>

        {/* businessPartnerEmail */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="Email do Parceiro"
            type="text"
            id="businessPartnerEmail"
            value={filters.businessPartnerEmail}
            onChange={value => handleChange('businessPartnerEmail', value)}
          />
        </Grid2>

        {/* businessPartnerDocumentNumber */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormField
            label="CPF ou CNPJ do Parceiro"
            type="text"
            id="businessPartnerDocumentNumber"
            value={filters.businessPartnerDocumentNumber}
            onChange={value =>
              handleChange('businessPartnerDocumentNumber', value, true)
            }
          />
        </Grid2>

        <Grid2 size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <ModalButton
            variant="outlined"
            sx={{
              color: theme.palette.error.main,
              border: `1px solid ${theme.palette.error.main}`,
              ':hover': {
                color: `${theme.palette.error.main}9e`,
                border: `1px solid ${theme.palette.error.main}9e`,
              },
            }}
            onClick={handleClose}
          >
            Cancelar
          </ModalButton>
          <ModalButton
            type="submit"
            variant="contained"
            sx={{
              bgcolor: theme.palette.success.main,
              ':hover': { bgcolor: `${theme.palette.success.main}9e` },
            }}
            onClick={() => handleFilter(filters)}
          >
            Filtrar
          </ModalButton>
        </Grid2>
      </Grid2>
    </ModalContainer>
  ) : null
}

export default Formulary
