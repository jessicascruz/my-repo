import { useState } from 'react'
import { toast } from 'react-toastify'

export const useCopyableLine = (value: string, label: string) => {
  const [copyIcon, setCopyIcon] = useState({
    icon: 'material-symbols:link-rounded',
    color: '',
    label: 'Copiar',
  })
  const handleCopy = () => {
    if (value.trim() === '') {
      toast.error(`${label} inválido. Não foi possível copiar.`)
      return
    }
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopyIcon({
          icon: 'material-symbols:link-rounded',
          color: '#10b122',
          label: 'Copiado',
        })
        setTimeout(
          () =>
            setCopyIcon({
              icon: 'material-symbols:link-rounded',
              color: 'var(--primary-main)',
              label: 'Copiar',
            }),
          1000
        )
      })
      .catch(err => {
        toast.error(`Erro ao copiar o ${label} ${err}`)
      })
  }

  return { handleCopy, copyIcon }
}
