export const removeLetters = (str: string | null | undefined) =>
    str === null || str === undefined ? str : str.replace(/[a-zA-Z]/g, '')
