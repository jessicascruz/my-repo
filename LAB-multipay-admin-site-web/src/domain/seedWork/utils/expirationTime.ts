function formatExpirationTime(totalHours: number, createdAt: Date): string {
  const expirationDate = new Date(
    createdAt.getTime() + totalHours * 60 * 60 * 1000
  )

  const day = String(expirationDate.getDate()).padStart(2, '0')
  const month = String(expirationDate.getMonth() + 1).padStart(2, '0')
  const year = expirationDate.getFullYear()

  const hours = String(expirationDate.getHours()).padStart(2, '0')
  const minutes = String(expirationDate.getMinutes()).padStart(2, '0')
  const seconds = String(expirationDate.getSeconds()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export default formatExpirationTime