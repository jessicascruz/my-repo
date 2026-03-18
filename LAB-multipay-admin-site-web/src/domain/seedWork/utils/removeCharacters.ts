export const removeCharacters = (str: string | null | undefined) =>
    str ? str.replace(/[^\d]/g, '') : str