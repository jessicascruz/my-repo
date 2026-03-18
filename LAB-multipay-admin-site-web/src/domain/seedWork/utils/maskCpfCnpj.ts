export function maskCpfCnpj(value: string): string {
  let digits = value.replace(/\D/g, '')

  // Limita a no máximo 14 dígitos (CNPJ)
  digits = digits.slice(0, 14)

  if (digits.length <= 11) {
    // CPF: 999.999.999-99
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  } else {
    // CNPJ: 99.999.999/9999-99
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }
}
