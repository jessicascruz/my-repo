import { z } from 'zod'

export const manualPaymentSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório'),

  amount: z
    .number()
    .min(0.01, 'O valor deve ser maior que zero'),

  files: z
    .array(z.instanceof(File))
    .min(1, 'É obrigatório anexar pelo menos um arquivo')
    .refine(
      files =>
        files.every(
          file =>
            file.type === 'application/pdf' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/png'
        ),
      'Apenas arquivos PDF, JPG ou PNG são permitidos'
    ),
})

export type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>
