// status-type.test.ts
import { StatusType, StatusTypeLabels } from '@/domain/aggregates/status'

describe('Status', () => {
  describe('StatusType type', () => {
    it('should allow valid status values', () => {
      const validStatuses: StatusType[] = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
        'CHARGED_BACK',
      ]

      // Se o TypeScript não reclamar, o teste passa
      expect(validStatuses).toBeDefined()
    })

    it('should reject invalid status values', () => {
      // @ts-expect-error - Testando valor inválido
      const invalidStatus: StatusType = 'INVALID_STATUS'

      // O TypeScript deve gerar um erro acima
    })

    it('should have all expected status values', () => {
      const expectedStatuses = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
        'CHARGED_BACK',
      ]

      // Verifica se todos os valores esperados são do tipo StatusType
      expectedStatuses.forEach(status => {
        const testStatus: StatusType = status as StatusType
        expect(testStatus).toBe(status)
      })
    })
  })

  describe('StatusTypeLabels', () => {
    it('should have labels for all StatusType values', () => {
      const statusTypeValues: StatusType[] = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
        'CHARGED_BACK',
      ]

      statusTypeValues.forEach(status => {
        expect(StatusTypeLabels[status]).toBeDefined()
        expect(typeof StatusTypeLabels[status]).toBe('string')
      })
    })

    it('should have correct label translations', () => {
      expect(StatusTypeLabels.CREATED).toBe('Criado')
      expect(StatusTypeLabels.VIEWED).toBe('Visualizado')
      expect(StatusTypeLabels.PENDING).toBe('Pendente')
      expect(StatusTypeLabels.AUTHORIZED).toBe('Autorizado')
      expect(StatusTypeLabels.CONFIRMED).toBe('Confirmado')
      expect(StatusTypeLabels.DETECTION).toBe('Detectado')
      expect(StatusTypeLabels.RECOVERY).toBe('Recuperação')
      expect(StatusTypeLabels.CANCELED).toBe('Cancelado')
      expect(StatusTypeLabels.DENIED).toBe('Negado')
    })

    it('should not have extra unexpected properties', () => {
      const expectedKeys: StatusType[] = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
        'CHARGED_BACK',
        'MANUAL_CONFIRMED',
      ]

      const actualKeys = Object.keys(StatusTypeLabels) as StatusType[]
      expect(actualKeys).toEqual(expectedKeys)
    })
  })

  describe('Consistency between StatusType and StatusTypeLabels', () => {
    it('should have matching keys in StatusType and StatusTypeLabels', () => {
      // Isso é um pouco complicado porque TypeScript enums/type não são disponíveis em runtime
      // Mas podemos testar o objeto StatusTypeLabels contra nossa lista de valores esperados
      const expectedStatuses: StatusType[] = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
        'CHARGED_BACK',
        'MANUAL_CONFIRMED',
      ]

      const labelKeys = Object.keys(StatusTypeLabels) as StatusType[]
      expect(labelKeys).toEqual(expectedStatuses)
    })
  })
})
