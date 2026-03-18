export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove o prefixo 'data:*/*;base64,' se necessário, 
      // ou mantenha se o backend souber lidar com ele.
      // Geralmente, o backend quer apenas a string base64.
      const base64String = result.split(',')[1]
      resolve(base64String)
    }
    reader.onerror = error => reject(error)
  })
}
