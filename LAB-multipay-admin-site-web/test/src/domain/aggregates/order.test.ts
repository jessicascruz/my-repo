// payment-enums.test.ts
import {
  MethodEnum,
  PaymentStatusEnum,
  TranslateStatusEnum,
  AcquirerEnum,
  CompanyEnum,
  companyDict,
} from '@/domain/aggregates/order'

describe('Order', () => {
  describe('MethodEnum', () => {
    it('should have correct payment methods', () => {
      expect(MethodEnum.CREDIT_CARD).toBe('CREDIT_CARD')
      expect(MethodEnum.TICKET).toBe('TICKET')
      expect(MethodEnum.PIX).toBe('PIX')
    })

    it('should have all expected payment methods', () => {
      const expectedMethods = ['CREDIT_CARD', 'TICKET', 'PIX']
      const actualMethods = Object.values(MethodEnum)

      expect(actualMethods).toEqual(expect.arrayContaining(expectedMethods))
      expect(actualMethods.length).toBe(expectedMethods.length)
    })
  })

  describe('PaymentStatusEnum', () => {
    it('should have correct payment status values', () => {
      expect(PaymentStatusEnum.PENDING).toBe('PENDING')
      expect(PaymentStatusEnum.AUTHORIZED).toBe('AUTHORIZED')
      expect(PaymentStatusEnum.CONFIRMED).toBe('CONFIRMED')
      expect(PaymentStatusEnum.CANCELED).toBe('CANCELED')
      expect(PaymentStatusEnum.DENIED).toBe('DENIED')
      expect(PaymentStatusEnum.CHARGED_BACK).toBe('CHARGED_BACK')
      expect(PaymentStatusEnum.REJECTED).toBe('REJECTED')
      expect(PaymentStatusEnum.ERROR).toBe('ERROR')
      expect(PaymentStatusEnum.REFUNDED).toBe('REFUNDED')
      expect(PaymentStatusEnum.PARTIALLY_REFUNDED).toBe('PARTIALLY_REFUNDED')
    })

    it('should have all expected payment statuses', () => {
      const expectedStatuses = [
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'CANCELED',
        'DENIED',
        'CHARGED_BACK',
        'REJECTED',
        'ERROR',
        'REFUNDED',
      ]
      const actualStatuses = Object.values(PaymentStatusEnum)
      expect(actualStatuses).toEqual(expect.arrayContaining(expectedStatuses))
      expect(actualStatuses.length).toBe(expectedStatuses.length + 1) // Account for PARTIALLY_REFUNDED
    })
  })

  describe('TranslateStatusEnum', () => {
    it('should have correct translations for payment statuses', () => {
      expect(TranslateStatusEnum.PENDING).toBe('Pendente')
      expect(TranslateStatusEnum.AUTHORIZED).toBe('Autorizado')
      expect(TranslateStatusEnum.CONFIRMED).toBe('Confirmado')
      expect(TranslateStatusEnum.CANCELED).toBe('Cancelado')
      expect(TranslateStatusEnum.DENIED).toBe('Negado')
      expect(TranslateStatusEnum.CHARGED_BACK).toBe('Estornado')
      expect(TranslateStatusEnum.REJECTED).toBe('Rejeitado')
      expect(TranslateStatusEnum.ERROR).toBe('Erro')
      expect(TranslateStatusEnum.REFUNDED).toBe('Reembolsado')
    })

    it('should have translations for all payment statuses', () => {
      const paymentStatusValues = Object.values(PaymentStatusEnum)
      const translateStatusKeys = Object.keys(TranslateStatusEnum)

      expect(translateStatusKeys.length).toBe(paymentStatusValues.length)

      paymentStatusValues.forEach(status => {
        expect(
          TranslateStatusEnum[status as keyof typeof TranslateStatusEnum]
        ).toBeDefined()
      })
    })
  })

  describe('AcquirerEnum', () => {
    it('should have correct numeric values for acquirers', () => {
      expect(AcquirerEnum.GETNET).toBe(1)
      ;(expect(AcquirerEnum.MERCADO_PAGO).toBe(2),
        expect(AcquirerEnum.SANTANDER).toBe(3)) // Enums numéricos incrementam automaticamente
    })

    it('should have all expected acquirers', () => {
      const expectedAcquirers = {
        GETNET: 1,
        MERCADO_PAGO: 2,
        SANTANDER: 3,
      }

      expect(AcquirerEnum.GETNET).toBe(expectedAcquirers.GETNET)
      expect(AcquirerEnum.MERCADO_PAGO).toBe(expectedAcquirers.MERCADO_PAGO)
      expect(AcquirerEnum.SANTANDER).toBe(expectedAcquirers.SANTANDER)

      const acquirerValues = Object.values(AcquirerEnum).filter(
        v => typeof v === 'number'
      )
      expect(acquirerValues.length).toBe(Object.keys(expectedAcquirers).length)
    })
  })

  describe('CompanyEnum', () => {
    it('should have correct numeric values for companies', () => {
      expect(CompanyEnum.MULTI).toBe(1)
      expect(CompanyEnum.GIGA).toBe(2)
      expect(CompanyEnum.GIGAWATTS).toBe(3)
    })

    it('should have all expected companies', () => {
      const expectedCompanies = {
        MULTI: 1,
        GIGA: 2,
        GIGAWATTS: 3,
      }

      expect(CompanyEnum.MULTI).toBe(expectedCompanies.MULTI)
      expect(CompanyEnum.GIGA).toBe(expectedCompanies.GIGA)
      expect(CompanyEnum.GIGAWATTS).toBe(expectedCompanies.GIGAWATTS)

      const companyValues = Object.values(CompanyEnum).filter(
        v => typeof v === 'number'
      )
      expect(companyValues.length).toBe(Object.keys(expectedCompanies).length)
    })
  })

  describe('companyDict', () => {
    it('should map company names to their enum values', () => {
      expect(companyDict.MULTI).toBe(CompanyEnum.MULTI)
      expect(companyDict.GIGA).toBe(CompanyEnum.GIGA)
      expect(companyDict.GIGAWATS).toBe(CompanyEnum.GIGAWATTS)
    })

    it('should have all expected company mappings', () => {
      const expectedMappings = {
        MULTI: CompanyEnum.MULTI,
        GIGA: CompanyEnum.GIGA,
        GIGAWATS: CompanyEnum.GIGAWATTS,
      }

      expect(companyDict).toEqual(expectedMappings)
    })
  })

  describe('Enum Consistency', () => {
    it('should have matching keys between PaymentStatusEnum and TranslateStatusEnum', () => {
      const paymentStatusKeys = Object.keys(PaymentStatusEnum)
      const translateStatusKeys = Object.keys(TranslateStatusEnum)

      expect(translateStatusKeys).toEqual(paymentStatusKeys)
    })
  })
})
