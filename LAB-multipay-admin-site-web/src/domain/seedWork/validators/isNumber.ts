export const isNumber = (value?: string | number): boolean => {
  return (
    value != null &&
    value.toString().trim() !== '' &&
    !isNaN(Number(value.toString()))
  )
}
