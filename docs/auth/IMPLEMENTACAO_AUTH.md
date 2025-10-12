# 🔐 Implementação de Autenticação - TradeBox

## 📋 Visão Geral

Implementação simplificada de autenticação para o projeto TradeBox, com suporte a dois tipos de usuários:
- **Varejistas (Retailer)**: Vendedores de produtos
- **Indústrias (Industry)**: Produtores de produtos

## 🏗️ Arquitetura

### 1. Schema do Banco de Dados

**Arquivo**: `schema_usuarios_simplificado.sql`

Tabela simplificada com campos essenciais:

```sql
CREATE TABLE usuarios (
    id NUMBER(10) PRIMARY KEY,
    email VARCHAR2(320) UNIQUE,
    password_hash VARCHAR2(255),
    nome VARCHAR2(255),
    categoria VARCHAR2(20), -- 'VAREJISTA' ou 'INDUSTRIA'
    tipo_pessoa CHAR(2),     -- 'PF' ou 'PJ'
    documento VARCHAR2(14) UNIQUE,
    telefone VARCHAR2(15),
    endereco VARCHAR2(500),
    ativo CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Regras de Negócio**:
- ✅ Indústrias **DEVEM** ser Pessoa Jurídica (CNPJ)
- ✅ Varejistas podem ser PF (CPF) ou PJ (CNPJ)
- ✅ Email único no sistema
- ✅ Documento (CPF/CNPJ) único no sistema

### 2. Estrutura de Arquivos

```
tradebox/
├── lib/
│   ├── types.ts              # Tipos TypeScript
│   ├── auth.ts               # Helpers de autenticação JWT
│   └── db.ts                 # Conexão Oracle (já existente)
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── register/route.ts  # API de cadastro
│   │       ├── login/route.ts     # API de login
│   │       ├── logout/route.ts    # API de logout
│   │       └── me/route.ts        # API para obter usuário atual
│   └── (site)/
│       └── auth/
│           ├── login/page.tsx     # Página de login
│           └── register/page.tsx  # Página de cadastro
└── schema_usuarios_simplificado.sql
```

## 🔧 Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **Oracle Database**: Banco de dados
- **bcryptjs**: Hash de senhas
- **jose**: JSON Web Tokens (JWT)
- **TypeScript**: Tipagem estática

## 🚀 Fluxo de Autenticação

### Cadastro (Register)

1. Usuário preenche formulário com:
   - Email
   - Senha
   - Nome/Razão Social
   - Tipo de usuário (Retailer/Industry)
   - Documento (CPF/CNPJ)
   - Telefone e endereço

2. Frontend valida:
   - Senhas coincidem
   - Indústrias usam CNPJ
   - Formato de documentos

3. API `/api/auth/register`:
   - Valida dados
   - Verifica duplicatas (email/documento)
   - Cria hash da senha (bcrypt)
   - Insere no banco
   - Cria token JWT
   - Define cookie httpOnly
   - Retorna redirecionamento

4. Redirecionamento automático:
   - Varejista → `/seller`
   - Indústria → `/industry`

### Login

1. Usuário informa email e senha

2. API `/api/auth/login`:
   - Busca usuário por email
   - Verifica se conta está ativa
   - Compara senha com hash
   - Cria token JWT
   - Define cookie httpOnly
   - Retorna redirecionamento

3. Redirecionamento automático baseado na categoria

### Sessão

- **Token JWT** armazenado em cookie httpOnly (seguro)
- **Duração**: 7 dias
- **Conteúdo do token**:
  ```typescript
  {
    userId: number,
    email: string,
    categoria: 'VAREJISTA' | 'INDUSTRIA',
    nome: string
  }
  ```

## 📝 Como Usar

### 1. Configurar Banco de Dados

Execute o script SQL:

```bash
sqlplus usuario/senha@conexao @schema_usuarios_simplificado.sql
```

### 2. Configurar Variáveis de Ambiente

Crie ou atualize `.env.local`:

```env
# Oracle Database
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_CONNECT_STRING=sua_conexao

# JWT Secret (use uma chave forte em produção!)
JWT_SECRET=seu-secret-super-secreto-altere-em-producao
```

### 3. Instalar Dependências

```bash
npm install bcryptjs jose cookie
```

### 4. Executar o Projeto

```bash
npm run dev
```

### 5. Testar

- **Cadastro**: http://localhost:3000/auth/register
- **Login**: http://localhost:3000/auth/login

## 🔒 Segurança Implementada

✅ **Senhas com Hash**: bcrypt com salt rounds = 10
✅ **JWT**: Tokens assinados com HS256
✅ **HttpOnly Cookies**: Protege contra XSS
✅ **Validação de Dados**: Frontend e backend
✅ **Verificação de Duplicatas**: Email e documento únicos
✅ **Contas Ativas**: Verifica status antes do login

## 📡 Endpoints da API

### POST `/api/auth/register`

Cadastra novo usuário.

**Body**:
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "nome": "Nome do Usuário",
  "categoria": "VAREJISTA",
  "tipo_pessoa": "PF",
  "documento": "12345678901",
  "telefone": "11999999999",
  "endereco": "Rua X, 123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Cadastro realizado com sucesso!",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "nome": "Nome do Usuário",
    "categoria": "VAREJISTA"
  },
  "redirectUrl": "/seller"
}
```

### POST `/api/auth/login`

Realiza login do usuário.

**Body**:
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "nome": "Nome do Usuário",
    "categoria": "VAREJISTA"
  },
  "redirectUrl": "/seller"
}
```

### POST `/api/auth/logout`

Realiza logout (remove cookie).

**Response**:
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### GET `/api/auth/me`

Retorna dados do usuário autenticado.

**Response**:
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "email": "usuario@email.com",
    "categoria": "VAREJISTA",
    "nome": "Nome do Usuário"
  }
}
```

## 🎯 Redirecionamentos

| Categoria  | Rota de Destino |
|-----------|-----------------|
| VAREJISTA | `/seller`       |
| INDUSTRIA | `/industry`     |

## 🧪 Dados de Teste

Para testes rápidos, você pode inserir usuários diretamente no banco:

```sql
-- Varejista (PF)
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento
) VALUES (
    'teste@varejista.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'João Silva',
    'VAREJISTA',
    'PF',
    '12345678901'
);

-- Indústria (PJ)
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento
) VALUES (
    'teste@industria.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'Indústria ABC S/A',
    'INDUSTRIA',
    'PJ',
    '12345678000195'
);
```

**Senha para ambos**: `password`

## 🔄 Próximos Passos (Opcional)

Para melhorar a solução em iterações futuras:

- [ ] Implementar recuperação de senha
- [ ] Adicionar verificação de email
- [ ] Implementar refresh tokens
- [ ] Adicionar middleware de proteção de rotas
- [ ] Implementar rate limiting
- [ ] Adicionar logs de auditoria
- [ ] Implementar 2FA (autenticação de dois fatores)

## 📚 Helpers Disponíveis

### `lib/auth.ts`

```typescript
// Criar token JWT
await createToken(payload)

// Verificar token JWT
await verifyToken(token)

// Definir cookie de autenticação
await setAuthCookie(token)

// Remover cookie de autenticação
await removeAuthCookie()

// Obter usuário atual
await getCurrentUser()

// Obter URL de redirecionamento
getRedirectUrl(categoria)

// Conversões
categoriaToUserType(categoria)    // VAREJISTA → 'retailer'
userTypeToCategoria(userType)      // 'retailer' → VAREJISTA
```

## 🆘 Troubleshooting

### Erro: "Email já cadastrado"
- Verifique se o email já existe no banco
- Use a query: `SELECT * FROM usuarios WHERE email = 'email@exemplo.com'`

### Erro: "Token inválido"
- Verifique se `JWT_SECRET` está configurado
- Limpe os cookies do navegador

### Erro: "Não autenticado"
- Verifique se o cookie está sendo enviado
- Verifique se o token não expirou

### Erro de conexão Oracle
- Verifique as credenciais no `.env.local`
- Teste a conexão: `GET /api/oracle`

## 📄 Licença

Projeto acadêmico - FIAP

---

**Desenvolvido para o projeto TradeBox** 🚀

