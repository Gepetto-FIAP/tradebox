# 🚀 Quick Start - Autenticação TradeBox

## ⚡ Instalação Rápida

### 1. Executar Script SQL no Oracle

```bash
sqlplus usuario/senha@conexao @schema_usuarios_simplificado.sql
```

### 2. Configurar Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```env
# Oracle Database
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_CONNECT_STRING=sua_conexao

# JWT Secret (altere em produção!)
JWT_SECRET=sua-chave-secreta-super-forte-aqui
```

### 3. Instalar Dependências (Já feito!)

```bash
npm install bcryptjs jose cookie
```

### 4. Testar

```bash
npm run dev
```

Acesse:
- **Cadastro**: http://localhost:3000/auth/register
- **Login**: http://localhost:3000/auth/login

## 🧪 Criando Usuários de Teste no Banco

### Opção 1: Via Frontend
Acesse `/auth/register` e preencha o formulário.

### Opção 2: Via SQL (Rápido para testes)

```sql
-- Varejista (PF) - Email: teste@varejista.com | Senha: password123
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, ativo
) VALUES (
    'teste@varejista.com',
    '$2b$10$K8X9oLMZQ3p3YjxZVr5xsOYqXG4kUH9VxM9mQI1w5gFZp4N1hOmwK',
    'João da Silva',
    'VAREJISTA',
    'PF',
    '12345678901',
    'Y'
);

-- Indústria (PJ) - Email: teste@industria.com | Senha: password123
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, ativo
) VALUES (
    'teste@industria.com',
    '$2b$10$K8X9oLMZQ3p3YjxZVr5xsOYqXG4kUH9VxM9mQI1w5gFZp4N1hOmwK',
    'Indústria ABC S/A',
    'INDUSTRIA',
    'PJ',
    '12345678000195',
    'Y'
);

COMMIT;
```

**Senha para ambos**: `password123`

## 📍 Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/register` | POST | Cadastro de novo usuário |
| `/api/auth/login` | POST | Login do usuário |
| `/api/auth/logout` | POST | Logout do usuário |
| `/api/auth/me` | GET | Dados do usuário logado |

## 🎯 Fluxo de Redirecionamento

Após login/cadastro, os usuários são redirecionados automaticamente:

| Tipo de Usuário | Rota |
|----------------|------|
| Varejista | `/seller` |
| Indústria | `/industry` |

## 🔍 Como Testar Login

1. Acesse: http://localhost:3000/auth/login
2. Use uma das credenciais acima
3. Você será redirecionado automaticamente para o dashboard correto!

## 📋 Validações Implementadas

✅ **Email único** no sistema
✅ **Documento (CPF/CNPJ) único** no sistema
✅ **Indústrias devem usar CNPJ** (validação automática)
✅ **Varejistas podem usar CPF ou CNPJ**
✅ **Senhas com hash bcrypt**
✅ **Sessão via JWT em cookie httpOnly** (7 dias)

## 🐛 Troubleshooting Rápido

### Erro: "Email já cadastrado"
```sql
-- Verificar emails existentes
SELECT email, categoria FROM usuarios;

-- Deletar usuário de teste
DELETE FROM usuarios WHERE email = 'teste@varejista.com';
COMMIT;
```

### Erro: "Não autenticado"
- Limpe os cookies do navegador (DevTools → Application → Cookies)
- Verifique se `JWT_SECRET` está configurado no `.env.local`

### Erro de conexão Oracle
```bash
# Teste a conexão
curl http://localhost:3000/api/oracle
```

## 📚 Documentação Completa

Para mais detalhes, consulte: `IMPLEMENTACAO_AUTH.md`

## 🎓 Estrutura de Arquivos Criados

```
tradebox/
├── schema_usuarios_simplificado.sql     # Script SQL do banco
├── IMPLEMENTACAO_AUTH.md                # Documentação completa
├── QUICK_START_AUTH.md                  # Este arquivo
├── lib/
│   ├── types.ts                         # Tipos TypeScript
│   └── auth.ts                          # Helpers JWT
└── app/api/auth/
    ├── register/route.ts                # API de cadastro
    ├── login/route.ts                   # API de login
    ├── logout/route.ts                  # API de logout
    └── me/route.ts                      # API do usuário atual
```

## ✨ Pronto!

Sua autenticação está configurada e funcionando! 🎉

Para adicionar proteção de rotas no futuro, você pode usar o helper `getCurrentUser()` do arquivo `lib/auth.ts` em qualquer página ou API.

