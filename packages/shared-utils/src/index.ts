export const isTruthy = (value: string | undefined | null): boolean => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const assertNever = (_value: never): never => {
  throw new Error('Unexpected value');
};