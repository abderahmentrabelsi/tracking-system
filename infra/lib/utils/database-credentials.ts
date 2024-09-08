export interface DatabaseCredentials {
  username: string;
  password: string;
  dbName: string;
  port: string;
}

export interface SecureDatabase<T = DatabaseCredentials> {
  getCredentials(): T;
}
