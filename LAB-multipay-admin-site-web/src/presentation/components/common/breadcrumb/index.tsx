import { Breadcrumbs, Link, Typography } from '@mui/material'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { ReactNode, useCallback } from 'react'

type Translations = (last: boolean) => {
  home: ReactNode
  order: ReactNode
  details: ReactNode
  refund: ReactNode
  [key: string]: ReactNode
}

export const BreadcrumbsComponent = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { id } = useParams()

  const translations: Translations = useCallback(
    (last: boolean) => {
      return {
        home: last ? (
          'Página Inicial'
        ) : (
          <Link href={`/home?${searchParams}`}>Página Inicial</Link>
        ),
        order: 'Ordens',
        details: last ? (
          'Detalhes'
        ) : (
          <Link href={`/order/${id}/details?${searchParams}`}>Detalhes</Link>
        ),
        refund: 'Estorno Direto',
      }
    },
    [searchParams, id]
  )

  // Filter out segments that are likely IDs (numbers, UUIDs) or special characters
  const pathnames = pathname
    .split('/')
    .filter(x => x)
    .filter(segment => {
      return /^[a-zA-Z-]+$/.test(segment)
    })

  return (
    pathnames && (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, mx: 2 }}>
        {!pathnames.some(item => item === 'home') && (
          <Typography color="text.primary" key={'/'}>
            {translations(false).home}
          </Typography>
        )}
        {pathnames?.map((value, index) => {
          const last = index === pathnames.length - 1
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const translatedValue = translations(last)[value] || value
          return (
            <Typography color="text.primary" key={to}>
              {translatedValue}
            </Typography>
          )
        })}
      </Breadcrumbs>
    )
  )
}
