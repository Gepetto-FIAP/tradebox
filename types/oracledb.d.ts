declare module 'oracledb' {
  export interface Connection {
    execute<T = any>(
      sql: string,
      binds?: any[] | Record<string, any>,
      options?: ExecuteOptions
    ): Promise<Result<T>>;
    close(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
  }

  export interface Result<T = any> {
    rows?: T[];
    rowsAffected?: number;
    outBinds?: any;
    metaData?: any[];
  }

  export interface ExecuteOptions {
    outFormat?: number;
    autoCommit?: boolean;
    resultSet?: boolean;
    maxRows?: number;
    fetchArraySize?: number;
  }

  export interface PoolAttributes {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    queueTimeout?: number;
    enableStatistics?: boolean;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(drainTime?: number): Promise<void>;
  }

  export function createPool(poolAttrs: PoolAttributes): Promise<Pool>;
  export function getConnection(connAttrs: {
    user: string;
    password: string;
    connectString: string;
  }): Promise<Connection>;

  export const OUT_FORMAT_ARRAY: number;
  export const OUT_FORMAT_OBJECT: number;
  export const BIND_OUT: number;
  export const BIND_IN: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CURSOR: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const BLOB: number;

  const oracledb: {
    createPool: typeof createPool;
    getConnection: typeof getConnection;
    OUT_FORMAT_ARRAY: number;
    OUT_FORMAT_OBJECT: number;
    BIND_OUT: number;
    BIND_IN: number;
    STRING: number;
    NUMBER: number;
    DATE: number;
    CURSOR: number;
    BUFFER: number;
    CLOB: number;
    BLOB: number;
  };

  export default oracledb;
}

