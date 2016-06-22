export function toUpperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function toCamelCase(str: string): string {
  return str.toString().replace(/[- ][a-z]/g, (car) => car[1].toUpperCase());
}

export function toUpperCamelCase(str: string): string {
  return toUpperFirst(toCamelCase(str));
}
