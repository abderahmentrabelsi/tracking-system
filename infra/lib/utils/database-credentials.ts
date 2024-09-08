export interface DatabaseCredentials {
  username: string;
  password: string;
  dbName: string;
  port: string;
}

export interface SecureDatabase<T = DatabaseCredentials> {
  getCredentials(): T;
}

export function generateRandomPassword(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%^&*()_+=-{}[]|:;<>,.?'; // Excludes '/', '@', '"', and space
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}