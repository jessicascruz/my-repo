export const formatToBrlCurrency = (
  value: string | number
): string | number => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return 'NaN'
    }
    if (!Number.isFinite(value)) {
      return value < 0 ? '-Infinity' : 'Infinity'
    }

    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }
  return value
}
