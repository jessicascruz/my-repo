import React, { useMemo } from 'react'
import { IManualPayment } from '@/domain/aggregates/order'
import { CollapsableListContainer } from '../components/CollapsableListContainer'
import { CollapsableListAccordion } from '../components/CollapsableListAccordion'
import { CollapsableListTable } from '../components/CollapsableListTable'
import { ManualPaymentRow } from './ManualPaymentRow'
import { useCollapsableList } from '@/presentation/hooks/useCollapsableList'
import { DetailsManualPaymentApprovalModal } from '../components/DetailsManualPaymentApprovalModal'

export const manualPaymentHeaders = [
  'Ações',
  'Id',
  'Status',
  'Motivo',
  'Valor',
  'Solicitante',
  'Anexos',
  'Criado em',
  'Aprovado em',
]

interface Props {
  manualPaymentData: IManualPayment[]
  onApprove?: (manualPaymentId: string, isApproved: boolean) => void
}

const ManualPayment = ({ manualPaymentData, onApprove }: Props) => {
  const [selectedPayment, setSelectedPayment] = React.useState<IManualPayment | null>(null)
  const hasData = manualPaymentData.length > 0
  const { dataByAcquirerType, getAccordionState, handleToggleAccordion } =
    useCollapsableList(manualPaymentData)

  const hasAcquirerData = useMemo(
    () => dataByAcquirerType.some(({ data }) => data.length > 0),
    [dataByAcquirerType]
  )

  const mappedAccordionData = useMemo(
    () =>
      dataByAcquirerType
        .filter(({ data }) => data.length > 0)
        .map(({ title, data, acquirer, imagePath }) => {
          return (
            <CollapsableListAccordion
              key={title}
              title={title}
              dataLength={data?.length}
              expanded={getAccordionState(acquirer)}
              imagePath={imagePath}
              onChange={handleToggleAccordion(acquirer)}
            >
              <CollapsableListTable headers={manualPaymentHeaders}>
                {data.map(value => (
                  <ManualPaymentRow
                    key={value.id}
                    data={value as IManualPayment}
                    files={(value as IManualPayment).receipts}
                    onApprove={onApprove}
                    onViewDetails={setSelectedPayment}
                  />
                ))}
              </CollapsableListTable>
            </CollapsableListAccordion>
          )
        }),
    [dataByAcquirerType, getAccordionState, handleToggleAccordion, onApprove]
  )

  const renderContent = () => {
    if (!hasAcquirerData) {
      return (
        <CollapsableListTable headers={manualPaymentHeaders}>
          {manualPaymentData.map(value => (
            <ManualPaymentRow
              key={value.id}
              data={value as IManualPayment}
              files={value.receipts}
              onApprove={onApprove}
              onViewDetails={setSelectedPayment}
            />
          ))}
        </CollapsableListTable>
      )
    }
    return mappedAccordionData
  }

  return (
    hasData && (
      <CollapsableListContainer title="Pagamentos Manuais">
        {renderContent()}
      </CollapsableListContainer>
    )
  )
}

export default ManualPayment
