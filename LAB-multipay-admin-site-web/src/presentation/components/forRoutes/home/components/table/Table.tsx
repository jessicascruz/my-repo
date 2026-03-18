import { StatusType } from '@/domain/aggregates/status'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import StatusBadge from '@/presentation/components/forRoutes/home/components/status/Status'
import { useCopyableLine } from '@/presentation/hooks/useCopyableLine'
import { useOrders } from '@/presentation/hooks/useOrders'
import { Icon } from '@iconify/react/dist/iconify.js'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import Pagination from '../pagination'
import { useFilterContext } from '@/presentation/context/filter-context'
import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { systemsOptions } from '@/domain/aggregates/options'
import Link from 'next/link'

const CopyButtonCell = ({ value, label }: { value: string; label: string }) => {
  const { handleCopy, copyIcon } = useCopyableLine(value, label)
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <IconButton
        type="button"
        aria-label={`Copy ${label}`}
        onClick={handleCopy}
        data-testid="copy-button"
        title={copyIcon.label}
      >
        <Icon icon={copyIcon.icon} color={copyIcon.color} />
      </IconButton>
    </Box>
  )
}

const DetailsButtonCell = ({
  id,
  searchParams,
}: {
  id: string
  searchParams: ReadonlyURLSearchParams
}) => {
  return (
    <Link
      href={`/order/${id}/details?${searchParams}`}
      style={{ height: '100%', display: 'flex', alignItems: 'center' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          height: '100%',
          width: '100%',
        }}
      >
        <IconButton
          color="primary"
          aria-label="Ver mais detalhes"
          title="Ver mais detalhes"
          sx={{ padding: 0 }}
        >
          <VisibilityIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Link>
  )
}

export default function StickyHeadTable() {
  const { filterData, setFilter } = useFilterContext()
  const { orders, paging, isLoading } = useOrders()
  const searchParams = useSearchParams()
  const [total, setTotal] = React.useState<number>(Math.ceil(paging.total))
  const [count, setCount] = React.useState<number>(
    Math.ceil(paging.total / paging.perPage)
  )

  React.useEffect(() => {
    if (paging.total && paging.perPage && Object.keys(filterData).length > 0) {
      const newCount = Math.ceil(paging.total / paging.perPage)

      setCount(newCount)
      setTotal(paging.total)

      const currentPage = Number(filterData.paging.page) || 1
      if (filterData.paging.page > newCount) {
        const newPage = Math.min(currentPage, newCount)
        setFilter({
          paging: new FilterPaging(
            newPage,
            filterData.paging.perPage,
            filterData.paging.sort,
            filterData.paging.sortCriteria
          ),
        })
      }
    }
  }, [paging, filterData, setFilter])

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'Identificador', flex: 1 },
    { field: 'referenceId', headerName: 'Referência', flex: 1 },
    { field: 'subReferenceId', headerName: 'Sub Referência', flex: 1 },
    {
      field: 'type',
      headerName: 'Tipo',
      flex: 1,
      // Temporary value until api eventually returns the expected value
      valueGetter: () => 'Recebimento',
    },
    {
      field: 'systemId',
      headerName: 'Sistema de origem',
      sortable: false,
      renderCell: params => {
        const system = systemsOptions.find(
          system => system.value === params.value
        )
        return `${system?.label} (${params.value})`
      },
    },
    {
      field: 'company',
      headerName: 'Empresa',
      renderCell: params => {
        return `${params.value.description} (${params.value.code})`
      },
    },
    {
      field: 'amount',
      headerName: 'Valor',
      flex: 1,
      valueFormatter: value => formatToBrlCurrency(value),
    },
    {
      field: 'createdAt',
      headerName: 'Data Criação',
      flex: 1.2,
      valueFormatter: isoToLocalePtBr,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.3,
      renderCell: params => <StatusBadge status={params.value as StatusType} />,
    },
    {
      field: 'paymentLink',
      headerName: 'Link',
      width: 80,
      sortable: false,
      renderCell: params => (
        <CopyButtonCell value={String(params.value)} label={params.row.label} />
      ),
    },
    {
      field: 'details',
      headerName: 'Ver mais',
      width: 100,
      sortable: false,
      renderCell: params => (
        <DetailsButtonCell id={params.row.id} searchParams={searchParams} />
      ),
    },
  ]

  return (
    Object.keys(filterData).length > 0 && (
      <Box
        sx={{
          height: 'calc(70vh) + 60px',
          width: '100%',
          px: 2,
          boxSizing: 'border-box',
        }}
      >
        <DataGrid
          disableRowSelectionOnClick
          rows={orders}
          columns={columns}
          getRowId={row => row.id}
          localeText={{
            noRowsLabel:
              orders.length === 0 && !isLoading
                ? 'Nenhum dado encontrado'
                : 'Carregando dados...',
          }}
          sx={{ borderRadius: 2 }}
        />
        <Pagination
          perPage={<Pagination.PerPage total={total} />}
          pages={
            <Pagination.Pages count={count} page={filterData.paging.page} />
          }
          goToPage={<Pagination.GoToPage />}
        />
      </Box>
    )
  )
}
