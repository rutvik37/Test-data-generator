// Shared TypeScript types for the frontend

export interface SchemaField {
  name: string;
  type: string;
}

export type GeneratedRecord = Record<string, string | number | boolean | null>;

export interface Template {
  name: string;
  schema: SchemaField[];
}

export type SetSchema = (value: SchemaField[] | ((val: SchemaField[]) => SchemaField[])) => void;

export interface User {
  email: string;
  username: string;
}

export type AuthMode = 'signin' | 'signup' | 'verify-otp';
