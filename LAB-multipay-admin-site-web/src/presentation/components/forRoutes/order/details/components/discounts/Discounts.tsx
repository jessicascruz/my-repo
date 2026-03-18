import React, { useMemo, useState } from 'react'
import { IDiscount } from '@/domain/aggregates/order'
import { CollapsableListContainer } from '../components/CollapsableListContainer'
import { CollapsableListAccordion } from '../components/CollapsableListAccordion'
import { CollapsableListTable } from '../components/CollapsableListTable'
import { DiscountRow } from './DiscountRow'

export const discountHeaders = [
  'ID do Sistema',
  'Criado em',
  'Solicitante',
  'Valor Antigo',
  'Valor Pedido',
  'Desconto Antigo',
  'Desconto Pedido',
]

interface Props {
  data?: IDiscount[]
}

const Discounts = ({ data = [] }: Props) => {
  const hasData = data.length > 0
  const [discountAccordionOpen, setDiscountAccordionOpen] = useState(hasData)

  const tableRows = useMemo(
    () => data.map(value => <DiscountRow key={value.id} data={value} />),
    [data]
  )

  return (
    hasData && (
      <CollapsableListContainer title="Descontos">
        <CollapsableListAccordion
          title="Todos"
          dataLength={data?.length}
          expanded={discountAccordionOpen}
          onChange={setDiscountAccordionOpen}
        >
          <CollapsableListTable headers={discountHeaders}>
            {tableRows}
          </CollapsableListTable>
        </CollapsableListAccordion>
      </CollapsableListContainer>
    )
  )
}

export default Discounts
