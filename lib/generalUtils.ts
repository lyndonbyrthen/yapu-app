
export const sortObjectKeys = <T extends Record<string, unknown>>(
  obj: T,
  compareFn?: (a: string, b: string) => number
): T => Object.fromEntries(
  Object.keys(obj)
    .sort(compareFn)
    .map((k) => [k, obj[k as keyof T]] as const)
) as T;
