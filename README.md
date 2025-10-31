# 📦 TradeBox

> **Projeto Acadêmico FIAP - Challenge 2025**  
> Sistema de Trade Marketing para conectar Varejistas e Indústrias

[![Demo](https://img.shields.io/badge/🌐_Demo_Online-tradebox--kappa.vercel.app-0070f3)](https://tradebox-kappa.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![Oracle](https://img.shields.io/badge/Oracle_DB-21c-red)](https://www.oracle.com/database/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)


---

## 🎯 Sobre o Projeto

**TradeBox** é uma plataforma completa de gerenciamento de produtos e vendas que facilita a conexão entre varejistas e indústrias, oferecendo:

- 🏪 **Dashboard Varejista**: Gerenciamento de vendas, scanner de produtos e métricas em tempo real
- 🏭 **Dashboard Indústria**: Cadastro de produtos, controle de catálogo e análise de distribuição
- 📊 **Analytics Avançados**: Dashboards interativos com métricas de vendas, lucro e performance
- 📱 **Scanner GTIN**: Leitura de códigos de barras (EAN/UPC) para consulta rápida de produtos
- 💰 **Análise de Margem**: Controle de preço de custo e cálculo automático de lucratividade
- 🔒 **Autenticação Robusta**: Sistema completo com JWT, bcrypt e controle de acesso por categoria

### 🌐 Demo Online

Acesse a aplicação em funcionamento: **[https://tradebox-kappa.vercel.app/](https://tradebox-kappa.vercel.app/)**

---

## 👥 Equipe de Desenvolvimento

Projeto desenvolvido por alunos do 2º ano da FIAP:

| Nome | Papel |
|------|-------|
| **Antonio Schappo** | Desenvolvedor Full Stack |
| **Eduardo Bialas** | Desenvolvedor Full Stack |
| **Guilherme Lopes** | Desenvolvedor Full Stack |
| **Higor** | Desenvolvedor Full Stack |
| **Luiz Gustavo** | Desenvolvedor Full Stack |

---

## 🚀 Como Executar o Projeto Localmente

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior ([Download](https://nodejs.org/))
- **Oracle Database** 21c ou superior ([Download XE](https://www.oracle.com/database/technologies/xe-downloads.html))
- **npm** ou **yarn** (vem com Node.js)
- **SQL Developer** ou **DBeaver** (para executar scripts SQL - opcional)

### 📦 Passo 1: Extrair o Projeto

Se você recebeu o projeto em formato `.zip`:

```bash
# Extraia o arquivo tradebox.zip
unzip tradebox.zip
cd tradebox
```

### 🔧 Passo 2: Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- Next.js 15.5
- React 19
- Oracle DB Driver (oracledb)
- JWT (jose)
- bcryptjs
- Chart.js
- ZXing (scanner de códigos de barras)

### 🗄️ Passo 3: Configurar o Banco de Dados Oracle

#### 3.1 Criar o Banco de Dados

Se você ainda não tem um banco Oracle configurado:

1. Instale o **Oracle Database XE** (gratuito) ou use uma instância existente
2. Inicie o serviço do Oracle
3. Conecte-se como usuário administrativo (SYSTEM ou SYS)

#### 3.2 Executar o Script de Inicialização

Execute o script SQL completo que cria todas as tabelas, sequences, triggers e dados de exemplo:

```bash
# Via SQL*Plus (se disponível)
sqlplus seu_usuario/sua_senha@localhost:1521/XEPDB1 @docs/database/INIT_DATABASE.sql

# OU via interface gráfica:
# 1. Abra SQL Developer ou DBeaver
# 2. Conecte-se ao seu banco Oracle
# 3. Abra o arquivo: docs/database/INIT_DATABASE.sql
# 4. Execute o script completo (F5)
```

O script irá criar:
- ✅ 6 Sequences (auto-incremento)
- ✅ 6 Tabelas (usuarios, categorias, produtos, clientes, vendas, itens_venda)
- ✅ Índices para performance
- ✅ Triggers de auditoria automática
- ✅ Dados de exemplo (categorias e usuários de teste)

### 🔑 Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copie o exemplo (se existir)
cp .env.example .env.local

# OU crie manualmente:
touch .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Oracle:

```env
# Oracle Database Connection
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# JWT Secret (use uma chave forte e aleatória!)
JWT_SECRET=mude-isso-para-uma-chave-forte-e-segura-em-producao

# Opcional: Next.js
NODE_ENV=development
```

> **⚠️ IMPORTANTE**: Nunca commit o arquivo `.env.local` no Git! Ele já está no `.gitignore`.

### ▶️ Passo 5: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **[http://localhost:3000](http://localhost:3000)**

### 🎉 Passo 6: Testar a Aplicação

#### Usuários de Teste

O script de inicialização cria automaticamente usuários de teste. Você pode fazer login com:

**Varejista (Seller):**
```
Email: joao.silva@email.com
Senha: password123
```

**Indústria (Industry):**
```
Email: maria.santos@industria.com
Senha: password123
```

#### Páginas Principais

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Registro**: http://localhost:3000/auth/register
- **Dashboard Varejista**: http://localhost:3000/seller (após login)
- **Dashboard Indústria**: http://localhost:3000/industry (após login)
- **Scanner**: http://localhost:3000/scan (após login)

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 15.5](https://nextjs.org/) com App Router
- **UI Library**: React 19
- **Styling**: CSS Modules
- **Charts**: Chart.js 4.5 + react-chartjs-2
- **Scanner**: @zxing/browser (leitura de códigos de barras)
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js 18+
- **Database**: Oracle Database 21c
- **ORM/Driver**: oracledb 6.9
- **Authentication**: JWT (jose 6.1) + bcryptjs
- **API**: Next.js API Routes

### DevOps
- **Deployment**: Vercel
- **Version Control**: Git
- **Package Manager**: npm

### Linguagens
- **TypeScript 5.9**: 100% tipado
- **SQL**: Oracle PL/SQL

---

## 📂 Estrutura do Projeto

```
tradebox/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (dashboard)/             # Rotas protegidas do dashboard
│   │   ├── 📁 industry/            # Dashboard da indústria
│   │   │   ├── 📁 analytics/       # Analytics da indústria
│   │   │   ├── 📁 products/        # Produtos da indústria
│   │   │   ├── layout.tsx          # Layout do dashboard
│   │   │   └── page.tsx            # Home da indústria
│   │   ├── 📁 seller/              # Dashboard do varejista
│   │   │   ├── 📁 analytics/       # Analytics do vendedor
│   │   │   ├── 📁 sell/            # Registrar vendas
│   │   │   ├── 📁 store/           # Gerenciar loja
│   │   │   └── page.tsx            # Home do vendedor
│   │   ├── 📁 scan/                # Scanner de códigos de barras
│   │   └── layout.tsx              # Layout geral do dashboard
│   ├── 📁 (site)/                  # Rotas públicas
│   │   ├── 📁 auth/                # Autenticação
│   │   │   ├── 📁 login/           # Página de login
│   │   │   └── 📁 register/        # Página de registro
│   │   ├── layout.tsx              # Layout do site público
│   │   └── page.tsx                # Home page
│   ├── 📁 api/                     # API Routes do Next.js
│   │   ├── 📁 auth/                # Endpoints de autenticação
│   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   ├── logout/route.ts     # POST /api/auth/logout
│   │   │   ├── me/route.ts         # GET /api/auth/me
│   │   │   └── register/route.ts   # POST /api/auth/register
│   │   ├── 📁 products/            # APIs de produtos
│   │   │   ├── route.ts            # GET/POST /api/products
│   │   │   ├── [id]/route.ts       # GET/PUT/DELETE /api/products/:id
│   │   │   └── batch/route.ts      # POST /api/products/batch
│   │   ├── 📁 sales/               # APIs de vendas
│   │   ├── 📁 categories/          # APIs de categorias
│   │   ├── 📁 industries/          # APIs de indústrias
│   │   ├── 📁 dashboard/           # APIs de métricas
│   │   ├── 📁 industry/            # APIs específicas da indústria
│   │   └── 📁 gtin/                # API de códigos GTIN
│   ├── layout.tsx                  # Root layout
│   └── 📁 styles/                  # Estilos globais
│       └── globals.css
├── 📁 components/                   # Componentes React
│   ├── 📁 dashboard/               # Componentes do dashboard
│   │   ├── 📁 Cards/               # Cards de métricas
│   │   ├── 📁 Charts/              # Gráficos
│   │   ├── 📁 Tables/              # Tabelas
│   │   └── 📁 Others/              # Outros componentes
│   ├── 📁 layout/                  # Componentes de layout
│   │   ├── 📁 Header/              # Cabeçalho
│   │   ├── 📁 Footer/              # Rodapé
│   │   └── 📁 BottomNav/           # Navegação inferior
│   └── 📁 ui/                      # Componentes UI reutilizáveis
│       ├── 📁 Button/
│       ├── 📁 Modal/
│       └── 📁 Table/
├── 📁 lib/                         # Bibliotecas e utilitários
│   ├── auth.ts                     # Funções de autenticação JWT
│   ├── authorization.ts            # Controle de acesso
│   ├── db.ts                       # Conexão com Oracle
│   ├── types.ts                    # Tipos TypeScript globais
│   ├── validators.ts               # Validadores de entrada
│   ├── queries.ts                  # Query builders
│   └── api-middleware.ts           # Middleware de APIs
├── 📁 docs/                        # 📚 Documentação completa
│   ├── 📁 auth/                    # Docs de autenticação
│   │   ├── IMPLEMENTACAO_AUTH.md   # Implementação completa
│   │   ├── QUICK_START_AUTH.md     # Guia rápido
│   │   └── AUTHORIZATION.md        # Sistema de autorização
│   ├── 📁 api/                     # Docs das APIs REST
│   │   ├── README_SELLER_API.md    # APIs do vendedor
│   │   └── README_INDUSTRY_API.md  # APIs da indústria
│   ├── 📁 database/                # Scripts e schemas SQL
│   │   ├── INIT_DATABASE.sql       # Script de inicialização
│   │   └── DIAGRAMA_ER.md          # Diagrama ER
│   ├── 📁 features/                # Docs de features
│   ├── 📁 integrations/            # Docs de integrações
│   │   └── gtin.md                 # API GTIN
│   └── README.md                   # Índice da documentação
├── 📁 public/                      # Arquivos estáticos
│   └── 📁 images/                  # Imagens
│       └── 📁 team/                # Fotos da equipe
├── middleware.ts                   # Middleware do Next.js
├── next.config.ts                  # Configuração do Next.js
├── tsconfig.json                   # Configuração do TypeScript
├── package.json                    # Dependências
├── .env.local                      # Variáveis de ambiente (criar)
└── README.md                       # 📖 Este arquivo
```

---

## 📚 Documentação Detalhada

A documentação completa está organizada no diretório [`/docs`](./docs). Consulte os seguintes documentos:

### 🔐 Autenticação & Autorização
- **[IMPLEMENTACAO_AUTH.md](./docs/auth/IMPLEMENTACAO_AUTH.md)** - Documentação técnica completa da autenticação
- **[QUICK_START_AUTH.md](./docs/auth/QUICK_START_AUTH.md)** - Guia rápido de configuração e troubleshooting
- **[AUTHORIZATION.md](./docs/auth/AUTHORIZATION.md)** - Sistema de controle de acesso por categoria de usuário

### 🔌 APIs REST
- **[README_SELLER_API.md](./docs/api/README_SELLER_API.md)** - Documentação completa das APIs do vendedor (produtos, vendas, dashboard)
- **[README_INDUSTRY_API.md](./docs/api/README_INDUSTRY_API.md)** - Documentação completa das APIs da indústria

### 🗄️ Banco de Dados
- **[INIT_DATABASE.sql](./docs/database/INIT_DATABASE.sql)** - Script de inicialização completo do banco
- **[DIAGRAMA_ER.md](./docs/database/DIAGRAMA_ER.md)** - Diagrama Entidade-Relacionamento

---

## 🎨 Funcionalidades Principais

### 🏪 Para Varejistas (Sellers)

#### Dashboard Principal
- ✅ Métricas de vendas em tempo real
- ✅ Gráficos de faturamento e lucro
- ✅ Top produtos mais vendidos
- ✅ Histórico completo de transações

#### Gestão de Produtos
- ✅ Cadastro de produtos via scanner GTIN/EAN
- ✅ Cadastro manual com formulário completo
- ✅ Edição e exclusão de produtos
- ✅ Busca por categoria e indústria
- ✅ Cálculo automático de margem de lucro

#### Registrar Vendas
- ✅ Scanner de códigos de barras integrado
- ✅ Registro manual de vendas
- ✅ Upload em lote via CSV/Excel
- ✅ Histórico de vendas filtráveis

#### Analytics
- ✅ Gráficos de vendas por período
- ✅ Análise de lucratividade
- ✅ Produtos mais rentáveis
- ✅ Tendências de vendas

### 🏭 Para Indústrias (Industries)

#### Dashboard Principal
- ✅ Visão geral de produtos no mercado
- ✅ Métricas de distribuição
- ✅ Performance de produtos
- ✅ Ranking de vendedores parceiros

#### Gestão de Catálogo
- ✅ Cadastro de produtos com GTIN
- ✅ Definição de preço de custo
- ✅ Controle de estoque
- ✅ Categorização de produtos

#### Analytics Avançados
- ✅ Vendas por região/vendedor
- ✅ Performance de produtos
- ✅ Insights de mercado
- ✅ Relatórios de distribuição

### 🔒 Segurança

- ✅ **Autenticação JWT**: Tokens seguros com expiração
- ✅ **Senhas com Hash**: bcrypt com salt rounds
- ✅ **Cookies httpOnly**: Proteção contra XSS
- ✅ **Validação de Dados**: Client-side e Server-side
- ✅ **Autorização por Categoria**: Controle de acesso granular
- ✅ **Validação de CPF/CNPJ**: Verificação de documentos
- ✅ **Proteção CSRF**: Tokens de sessão seguros

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento na porta 3000
                     # Usa Turbopack para hot-reload ultra-rápido

# Build de Produção
npm run build        # Cria build otimizado para produção
                     # Gera páginas estáticas e server-side

# Produção
npm run start        # Inicia servidor de produção
                     # Serve a build criada pelo comando anterior

# Outros comandos úteis
npm install          # Instala todas as dependências
npm update           # Atualiza dependências para versões compatíveis
```

---

## 🐛 Troubleshooting

### ❌ Erro de Conexão com Oracle

**Problema**: `ORA-12541: TNS:no listener` ou `Cannot connect to database`

**Solução**:
1. Verifique se o Oracle está rodando:
   ```bash
   # No Windows
   services.msc  # Procure por OracleServiceXE
   
   # No Linux/Mac
   ps aux | grep oracle
   ```
2. Confirme a connection string no `.env.local`
3. Teste a conexão usando SQL*Plus ou SQL Developer

### ❌ Erro de Autenticação JWT

**Problema**: `Invalid token` ou redirecionamento constante para login

**Solução**:
1. Limpe os cookies do navegador
2. Verifique se o `JWT_SECRET` está definido no `.env.local`
3. Faça logout e login novamente

### ❌ Dependências não instaladas

**Problema**: `Module not found` ou `Cannot find package`

**Solução**:
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro ao executar script SQL

**Problema**: `Table already exists` ou `Sequence already exists`

**Solução**:
1. Se quiser recriar tudo, execute antes:
   ```sql
   -- Dropar tabelas na ordem correta
   DROP TABLE itens_venda CASCADE CONSTRAINTS;
   DROP TABLE vendas CASCADE CONSTRAINTS;
   DROP TABLE clientes CASCADE CONSTRAINTS;
   DROP TABLE produtos CASCADE CONSTRAINTS;
   DROP TABLE categorias CASCADE CONSTRAINTS;
   DROP TABLE usuarios CASCADE CONSTRAINTS;
   ```
2. Depois execute o `INIT_DATABASE.sql`

### ❌ Scanner não funciona

**Problema**: Scanner de códigos de barras não abre a câmera

**Solução**:
1. Use **HTTPS** ou **localhost** (HTTP não funciona em produção)
2. Permita o acesso à câmera no navegador
3. Teste em um dispositivo com câmera funcional

Para mais problemas, consulte a [documentação de troubleshooting](./docs/auth/QUICK_START_AUTH.md#-troubleshooting-rápido).

---

## 🧪 Testando a Aplicação

### Dados de Teste

O script `INIT_DATABASE.sql` já cria usuários e dados de teste:

#### Usuários

| Email | Senha | Categoria | Descrição |
|-------|-------|-----------|-----------|
| joao.silva@email.com | password123 | VAREJISTA | Vendedor de teste |
| maria.santos@industria.com | password123 | INDUSTRIA | Indústria de teste |

#### Categorias
- Alimentos e Bebidas
- Eletrônicos
- Vestuário
- Higiene e Limpeza
- Móveis e Decoração

### Fluxo de Teste Sugerido

1. **Teste como Indústria**:
   - Login com maria.santos@industria.com
   - Cadastre alguns produtos com GTIN
   - Defina preços de custo
   - Visualize o dashboard

2. **Teste como Varejista**:
   - Login com joao.silva@email.com
   - Navegue para "Minha Loja"
   - Escaneie ou cadastre produtos manualmente
   - Registre algumas vendas
   - Visualize analytics e lucros

3. **Teste o Scanner**:
   - Acesse /scan
   - Permita acesso à câmera
   - Escaneie um código de barras real
   - Veja os dados do produto retornados

---

## 🚢 Deploy

### Deploy na Vercel (Recomendado)

O projeto já está configurado para deploy automático na Vercel:

1. **Fork o repositório** no GitHub
2. **Conecte à Vercel**: [vercel.com/new](https://vercel.com/new)
3. **Configure as variáveis de ambiente**:
   - `ORACLE_USER`
   - `ORACLE_PASSWORD`
   - `ORACLE_CONNECT_STRING`
   - `JWT_SECRET`
4. **Deploy!** 🎉

### Deploy Manual

```bash
# Build local
npm run build

# Inicie em produção
npm run start
```

---

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `ORACLE_USER` | Usuário do Oracle | `system` | ✅ Sim |
| `ORACLE_PASSWORD` | Senha do Oracle | `oracle123` | ✅ Sim |
| `ORACLE_CONNECT_STRING` | String de conexão | `localhost:1521/XEPDB1` | ✅ Sim |
| `JWT_SECRET` | Chave secreta JWT | `sua-chave-super-secreta` | ✅ Sim |
| `NODE_ENV` | Ambiente Node | `development` | ❌ Não |

> **⚠️ SEGURANÇA**: Nunca comite o arquivo `.env.local`! Ele já está no `.gitignore`.

---

## 📊 Schema do Banco de Dados

O banco de dados possui 6 tabelas principais:

```
usuarios (id, email, password_hash, nome, categoria, documento, telefone)
    ↓
categorias (id, nome, descricao)
    ↓
produtos (id, nome, categoria_id, industria_id, preco_venda, preco_custo, gtin)
    ↓
clientes (id, nome, documento, telefone)
    ↓
vendas (id, vendedor_id, cliente_id, data_venda, valor_total)
    ↓
itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal)
```

**Relacionamentos:**
- Um usuário (indústria) pode ter muitos produtos
- Um produto pertence a uma categoria
- Uma venda pertence a um vendedor e um cliente
- Uma venda pode ter múltiplos itens
- Cada item está associado a um produto

Para mais detalhes, veja o [Diagrama ER completo](./docs/database/DIAGRAMA_ER.md).

---

## 📄 Licença

Este é um projeto acadêmico desenvolvido para a **FIAP - Faculdade de Informática e Administração Paulista** como parte do **Challenge 2025**.

**Propósito**: Fins educacionais e acadêmicos.

---

### Links do Projeto

- 🌐 **Demo Online**: https://tradebox-kappa.vercel.app/
- 📦 **Repositório**: [GitHub](https://github.com/Gepetto-FIAP/tradebox)
- 📚 **Documentação**: [/docs](./docs)

---

*Projeto Acadêmico FIAP - Challenge 2025*
