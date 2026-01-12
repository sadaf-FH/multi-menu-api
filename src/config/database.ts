function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const DB_NAME = required('DB_NAME');
export const DB_USER = required('DB_USER');
export const DB_PASS = required('DB_PASS');
export const DB_HOST = required('DB_HOST');
