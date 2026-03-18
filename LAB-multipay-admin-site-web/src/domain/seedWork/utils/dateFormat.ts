import moment from 'moment'

export const isoToLocalePtBr = (dateString?: string) => {
  if (!dateString || !moment(dateString, moment.ISO_8601, true).isValid())
    return ''

  return moment.utc(dateString).format('DD/MM/YYYY HH:mm:ss')
}

