export type Primitive = string | number | boolean | null | undefined;

export type NestedObject = Record<string, any>;

export type CamelCaseTransformer = (
  value: any,
  key?: string
) => any;

export function snakeCaseToCamelCase<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => snakeCaseToCamelCase(item)) as unknown as T;
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      let newKey: string;
      
      if (key === 'id') {
        newKey = '_id';
      } else {
        newKey = key.replace(/(_\w)/g, (match) => match[1].toUpperCase());
      }
      
      result[newKey] = snakeCaseToCamelCase(value);
    }
    
    return result as unknown as T;
  }

  return data as T;
}

export const responseTransformer = {
  snakeCaseToCamelCase,
};