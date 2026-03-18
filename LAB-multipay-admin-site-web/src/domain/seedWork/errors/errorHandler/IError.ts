export default interface IError {
  message: string // Developer description of error
  detailedMessage: string // receives the error message from the API
  errorCode: string // Error code to identify easily where is the error into the code
}
