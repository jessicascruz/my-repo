import { errorsConstructor } from '@/domain/seedWork/errors/errorsConstructor'
import { ErrorMessages } from '@/domain/seedWork/errors/errorMessages/messagesPicker'
import IError from '@/domain/seedWork/errors/errorHandler/IError'

describe('errorsConstructor', () => {
  // Test each error message type
  const errorTypes: ErrorMessages[] = [
    'signoutHandshakeError',
    'refreshAccessTokenNotOkError',
    'refreshAccessTokenCatchError',
    'errorOnGet',
    'errorOnDelete',
    'errorOnPost',
    'errorOnPatch',
    'errorOnPut',
  ]

  errorTypes.forEach(errorType => {
    it(`should construct correct error for ${errorType}`, () => {
      const mockError = new Error('Test error message')
      const result = errorsConstructor(mockError, errorType)

      expect(result).toEqual({
        message: expect.any(String),
        detailedMessage: 'Test error message',
        errorCode: expect.any(String),
      })
    })
  })

  it('should use response.data when available', () => {
    const mockError = {
      response: { data: 'API error details' },
      message: 'Generic error',
    }
    const result = errorsConstructor(mockError, 'errorOnGet')

    expect(result.detailedMessage).toBe('API error details')
  })

  it('should fall back to error.message when no response.data', () => {
    const mockError = new Error('Something went wrong')
    const result = errorsConstructor(mockError, 'errorOnPost')

    expect(result.detailedMessage).toBe('Something went wrong')
  })

  it('should use "unknown error" when no message available', () => {
    const mockError = {}
    const result = errorsConstructor(mockError, 'errorOnPut')

    expect(result.detailedMessage).toBe('unknown error')
  })

  it('should handle axios error structure', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { message: 'Custom error from API' },
      },
      message: 'Request failed',
    }
    const result = errorsConstructor(axiosError, 'refreshAccessTokenNotOkError')

    expect(result.detailedMessage).toEqual({ message: 'Custom error from API' })
  })

  it('should return correct structure for each error type', () => {
    const testCases: { type: ErrorMessages; expected: Partial<IError> }[] = [
      {
        type: 'signoutHandshakeError',
        expected: {
          message: 'Error on SignOut Handshake',
          errorCode: 'signoutHandshake.catchError',
        },
      },
      {
        type: 'errorOnGet',
        expected: {
          message: 'Error on get',
          errorCode: 'axiosHttpClientError.get',
        },
      },
      // Add all other error types here
    ]

    testCases.forEach(({ type, expected }) => {
      const result = errorsConstructor(new Error('test'), type)
      expect(result.message).toBe(expected.message)
      expect(result.errorCode).toBe(expected.errorCode)
    })
  })
})
