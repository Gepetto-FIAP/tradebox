# 📦 TradeBox

Sistema de gerenciamento de produtos e vendas desenvolvido com Next.js 15 e Oracle Database para conectar varejistas e indústrias.

## 🎯 Sobre o Projeto

TradeBox é uma plataforma que facilita a conexão entre varejistas e indústrias, permitindo:
- 🏪 **Varejistas**: Gerenciar vendas, escanear produtos e acompanhar métricas
- 🏭 **Indústrias**: Cadastrar produtos, gerenciar catálogo e analisar distribuição
- 📊 **Analytics**: Dashboards com métricas de vendas e desempenho
- 📱 **Scanner GTIN**: Leitura de códigos de barras para consulta de produtos

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ 
- Oracle Database (local ou cloud)
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd tradebox

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Execute o script SQL do banco
# Ver: docs/database/schema_usuarios_simplificado.sql

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📚 Documentação

A documentação completa está organizada no diretório [`/docs`](./docs):

### 🔐 Autenticação
- [Guia Rápido de Autenticação](./docs/auth/QUICK_START_AUTH.md) - Comece aqui!
- [Documentação Completa de Auth](./docs/auth/IMPLEMENTACAO_AUTH.md) - Detalhes técnicos

### 🗄️ Banco de Dados
- [Schema SQL](./docs/database/schema_usuarios_simplificado.sql) - Tabela de usuários

### 🔌 Integrações
- [API GTIN](./docs/integrations/gtin.md) - Scanner de códigos de barras

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: React 19 + CSS Modules
- **Banco de Dados**: Oracle Database
- **Autenticação**: JWT + bcryptjs + jose
- **Charts**: Chart.js + react-chartjs-2
- **Scanner**: @zxing/browser
- **Tipagem**: TypeScript

## 📂 Estrutura do Projeto

```
tradebox/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Rotas protegidas do dashboard
│   │   ├── industry/        # Dashboard da indústria
│   │   ├── seller/          # Dashboard do varejista
│   │   └── scan/            # Scanner de produtos
│   ├── (site)/              # Rotas públicas
│   │   └── auth/            # Login e registro
│   └── api/                 # API Routes
│       ├── auth/            # Endpoints de autenticação
│       ├── gtin/            # API de produtos GTIN
│       └── oracle/          # Testes de conexão
├── components/              # Componentes React reutilizáveis
├── lib/                     # Helpers e utilitários
│   ├── auth.ts             # Funções de autenticação JWT
│   ├── db.ts               # Conexão com Oracle
│   └── types.ts            # Tipos TypeScript
└── docs/                    # 📚 Documentação completa
    ├── auth/               # Docs de autenticação
    ├── database/           # Scripts SQL
    └── integrations/       # Docs de APIs externas
```

## 🔑 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Oracle Database
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# JWT Secret (use uma chave forte!)
JWT_SECRET=sua-chave-secreta-super-forte-aqui
```

### Banco de Dados

Execute o script SQL para criar as tabelas:

```bash
# Via SQL*Plus (se disponível)
sqlplus usuario/senha@conexao @docs/database/schema_usuarios_simplificado.sql

# Ou via SQL Developer / DBeaver (interface gráfica)
```

## 👥 Tipos de Usuários

### Varejista (Retailer)
- Dashboard de vendas
- Scanner de produtos
- Gestão de loja
- Analytics de vendas

### Indústria (Industry)
- Cadastro de produtos
- Gestão de catálogo
- Analytics de distribuição
- Controle de produção

## 🧪 Testes

Para testar rapidamente, você pode criar usuários de teste via SQL:

```sql
-- Ver exemplos completos em: docs/auth/QUICK_START_AUTH.md
INSERT INTO usuarios (email, password_hash, nome, categoria, tipo_pessoa, documento)
VALUES ('teste@varejista.com', '$2b$10$...', 'João Silva', 'VAREJISTA', 'PF', '12345678901');
```

**Senha padrão dos exemplos**: `password123`

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Produção
npm run start        # Inicia servidor de produção
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt
- ✅ JWT com cookies httpOnly
- ✅ Validação de dados no frontend e backend
- ✅ Proteção contra XSS e CSRF
- ✅ Validações de documentos (CPF/CNPJ)

## 🐛 Troubleshooting

Consulte os guias de troubleshooting na documentação:
- [Problemas com Autenticação](./docs/auth/QUICK_START_AUTH.md#-troubleshooting-rápido)
- [Problemas com Banco de Dados](./docs/database/schema_usuarios_simplificado.sql)
- [Problemas com GTIN](./docs/integrations/gtin.md)

## 🤝 Contribuindo

Este é um projeto acadêmico da FIAP. Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Projeto acadêmico desenvolvido para a FIAP.

## 👨‍💻 Autores

Desenvolvido como projeto acadêmico - FIAP | Ano 2

## 📞 Suporte

Para dúvidas ou problemas, consulte a [documentação completa](./docs/README.md) ou abra uma issue no repositório.

---

**Feito com ❤️ usando Next.js 15 e Oracle Database**
