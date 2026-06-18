type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function toClassNames(value: ClassValue): string[] {
  if (!value) return [];

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toClassNames);
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  return [];
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(toClassNames).join(' ');
}