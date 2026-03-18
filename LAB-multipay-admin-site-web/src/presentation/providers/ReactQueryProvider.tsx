import { getQueryClient } from '@/domain/seedWork/libs/reactQuery/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}
const ReactQueryProvider = ({ children }: Props) => {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default ReactQueryProvider
