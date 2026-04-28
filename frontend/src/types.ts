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
  profileImage?: string;
  status?: 'active' | 'deactivated' | 'deleted_by_admin' | 'deleted_by_user';
}

export type AuthMode = 'signin' | 'signup' | 'verify-otp';

export interface TestCase {
  id: string;
  field: string;
  title: string;
  steps?: string;
  expectedResult?: string;
}

export interface TestCaseResult {
  positive: TestCase[];
  negative: TestCase[];
  edge: TestCase[];
}
