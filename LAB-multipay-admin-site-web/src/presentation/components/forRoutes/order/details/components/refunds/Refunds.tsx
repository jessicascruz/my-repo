import React, { useMemo } from 'react'
import { IRefund } from '@/domain/aggregates/order'
import { CollapsableListContainer } from '../components/CollapsableListContainer'
import { CollapsableListAccordion } from '../components/CollapsableListAccordion'
import { CollapsableListTable } from '../components/CollapsableListTable'
import { RefundRow } from './RefundRow'
import { useCollapsableList } from '@/presentation/hooks/useCollapsableList'

export const refundsHeaders = [
  'EC',
  'ID Pagamento',
  'ID de Estorno',
  'Valor',
  'Criado em',
  'Atualizado em',
  'Solicitante',
  'Status Adquirente',
]

interface Props {
  refundData?: IRefund[]
}

const Refunds = ({ refundData = [] }: Props) => {
  const hasData = refundData.length > 0
  const { dataByAcquirerType, getAccordionState, handleToggleAccordion } =
    useCollapsableList(refundData)

  const mappedAccordionData = useMemo(
    () =>
      dataByAcquirerType.map(({ title, data, acquirer, imagePath }) => {
        return (
          <CollapsableListAccordion
            key={title}
            title={title}
            dataLength={data?.length}
            expanded={getAccordionState(acquirer)}
            imagePath={imagePath}
            onChange={handleToggleAccordion(acquirer)}
          >
            <CollapsableListTable headers={refundsHeaders}>
              {data.map(value => (
                <RefundRow key={value.id} data={value as IRefund} />
              ))}
            </CollapsableListTable>
          </CollapsableListAccordion>
        )
      }),
    [dataByAcquirerType, getAccordionState, handleToggleAccordion]
  )

  return (
    hasData && (
      <CollapsableListContainer title="Estornos (Direto)">
        {mappedAccordionData}
      </CollapsableListContainer>
    )
  )
}

export default Refunds
