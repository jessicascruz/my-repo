import { CardContent } from '@mui/material'
import moment from 'moment'
import SelectedFilter from './SelectedFilters'
import { useFilterContext } from '@/presentation/context/filter-context'
import { Filter } from '@/domain/aggregates/filter/filter'
import {
  companyOptions,
  statusOptions,
  systemsOptions,
} from '@/domain/aggregates/options'

const RenderFilters = () => {
  const { setFilter, filterData } = useFilterContext()

  const handleRemoveFilter = (key: keyof Filter) => {
    delete filterData[key]
    setFilter(filterData)
  }

  const filtersToRender = [
    {
      condition: !!filterData.dateRange?.start,
      label: `${moment(filterData.dateRange?.start).format(
        'DD/MM/YYYY'
      )} até ${moment(
        filterData.dateRange?.end ?? filterData.dateRange?.start
      ).format('DD/MM/YYYY')}`,
      field: 'dateRange',
    },
    {
      condition: !!filterData.orderId,
      label: `ID: ${filterData.orderId}`,
      field: 'orderId',
    },
    {
      condition: !!filterData.referenceId,
      label: `Referência: ${filterData.referenceId}`,
      field: 'referenceId',
    },
    {
      condition: !!filterData.createdAt,
      label: `Data de criação: ${moment(filterData.createdAt).format('DD/MM/YYYY')}`,
      field: 'createdAt',
    },
    {
      condition: !!filterData.company,
      label: `Compania: ${companyOptions.find(option => option.value === filterData.company)?.label}`,
      field: 'company',
    },
    {
      condition: !!filterData.systemId,
      label: `Sistema: ${systemsOptions.find(option => Number(option.value) === Number(filterData.systemId))?.label}`,
      field: 'systemId',
    },
    {
      condition: !!filterData.status,
      label: `Status: ${statusOptions.find(option => option.value === filterData.status)?.label}`,
      field: 'status',
    },
    {
      condition: !!filterData.businessPartnerId,
      label: `ID do Parceiro: ${filterData.businessPartnerId}`,
      field: 'businessPartnerId',
    },
    {
      condition: !!filterData.businessPartnerEmail,
      label: `Email do Parceiro: ${filterData.businessPartnerEmail}`,
      field: 'businessPartnerEmail',
    },
    {
      condition: !!filterData.businessPartnerDocumentNumber,
      label: `CPF ou CNPJ do Parceiro: ${filterData.businessPartnerDocumentNumber}`,
      field: 'businessPartnerDocumentNumber',
    },
  ]

  return (
    <CardContent
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        maxWidth: '75%',
        justifyContent: 'start',
        padding: '0',
      }}
    >
      {filtersToRender?.map(
        ({ condition, label, field }) =>
          condition && (
            <SelectedFilter
              key={label}
              label={label}
              deleteFieldFn={handleRemoveFilter}
              field={field as keyof Filter}
            />
          )
      )}
    </CardContent>
  )
}

export default RenderFilters
