const oracledb = require('oracledb');

// Dados mock para demonstração quando não há banco configurado
export const mockUsers = [
  {
    ID: 1,
    EMAIL: 'demo@varejista.com',
    PASSWORD_HASH: '$2b$10$5c3oFuJvdbg.X9hg54gfwO/Dhkfd5Elv8GhlxP2/dnROzcxb5taCG', // password123
    NOME: 'João Silva - Varejista Demo',
    CATEGORIA: 'retailer' as const,
    TIPO_PESSOA: 'PF',
    DOCUMENTO: '12345678901',
    ATIVO: 'Y'
  },
  {
    ID: 2,
    EMAIL: 'demo@industria.com',
    PASSWORD_HASH: '$2b$10$5c3oFuJvdbg.X9hg54gfwO/Dhkfd5Elv8GhlxP2/dnROzcxb5taCG', // password123
    NOME: 'Indústria ABC S/A - Demo',
    CATEGORIA: 'industry' as const,
    TIPO_PESSOA: 'PJ',
    DOCUMENTO: '12345678000195',
    ATIVO: 'Y'
  }
];

export function isDatabaseConfigured(): boolean {
  return !!(
    process.env.ORACLE_USER && 
    process.env.ORACLE_PASSWORD && 
    process.env.ORACLE_CONNECT_STRING
  );
}

export function findMockUserByEmail(email: string) {
  return mockUsers.find(user => user.EMAIL.toLowerCase() === email.toLowerCase());
}

export function checkEmailExists(email: string): boolean {
  return mockUsers.some(user => user.EMAIL.toLowerCase() === email.toLowerCase());
}

export function checkDocumentExists(documento: string): boolean {
  return mockUsers.some(user => user.DOCUMENTO === documento.replace(/\D/g, ''));
}

export async function connectOracle() {
    if (!isDatabaseConfigured()) {
        throw new Error('MOCK_MODE: Database not configured. Using mock data for demonstration.');
    }
    
    return await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECT_STRING,
    });
}