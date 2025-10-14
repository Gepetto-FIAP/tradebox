# 📚 Documentação TradeBox

Bem-vindo à documentação do projeto TradeBox! Aqui você encontrará toda a documentação técnica organizada por categoria.

## 📂 Estrutura da Documentação

### 🔐 Autenticação & Autorização (`/auth`)

Documentação completa do sistema de autenticação e controle de acesso:

- **[IMPLEMENTACAO_AUTH.md](./auth/IMPLEMENTACAO_AUTH.md)** - Documentação técnica completa da implementação de autenticação
  - Arquitetura e estrutura
  - Schema do banco de dados
  - Endpoints da API
  - Helpers e tipos TypeScript
  - Fluxo de autenticação
  - Exemplos de uso

- **[QUICK_START_AUTH.md](./auth/QUICK_START_AUTH.md)** - Guia rápido de configuração
  - Instalação rápida
  - Configuração de variáveis de ambiente
  - Criação de usuários de teste
  - Troubleshooting comum

- **[AUTHORIZATION.md](./auth/AUTHORIZATION.md)** - Sistema de controle de acesso por categoria
  - Regras de acesso por tipo de usuário
  - Proteção de rotas
  - Fluxo de autorização
  - Matriz de permissões
  - Exemplos práticos

### 🔌 Integrações (`/integrations`)

Documentação das integrações com APIs externas:

- **[gtin.md](./integrations/gtin.md)** - Integração com API de códigos GTIN/EAN
  - Como funciona o sistema de códigos de barras
  - API de consulta de produtos
  - Exemplos de uso
  - Troubleshooting

### 🗄️ Banco de Dados (`/database`)

Scripts e schemas do banco de dados Oracle:

- **[schema_usuarios_simplificado.sql](./database/schema_usuarios_simplificado.sql)** - Schema da tabela de usuários
  - Estrutura da tabela
  - Constraints e validações
  - Índices otimizados
  - Triggers automáticos
  - Exemplos de inserção

- **[schema_produtos_vendas.sql](./database/schema_produtos_vendas.sql)** - Schema completo de produtos e vendas
  - Tabelas: categorias, produtos, clientes, vendas, itens_venda
  - Relacionamentos e foreign keys
  - Índices para performance
  - Triggers automáticos
  - Queries úteis para dashboards
  - Dados de exemplo para testes

- **[README_SCHEMA_PRODUTOS.md](./database/README_SCHEMA_PRODUTOS.md)** - Documentação completa do schema
  - Diagrama de relacionamentos
  - Fluxos de trabalho (cadastro, venda, estoque)
  - Queries para cada dashboard
  - Guia de instalação
  - Integrações e APIs
  - Troubleshooting

- **[DIAGRAMA_ER.md](./database/DIAGRAMA_ER.md)** - Diagrama Entidade-Relacionamento visual
  - Diagrama completo em ASCII
  - Relacionamentos detalhados
  - Cardinalidades e constraints
  - Exemplos de fluxos
  - Regras de negócio

## 🚀 Início Rápido

Para começar rapidamente, consulte os seguintes documentos nesta ordem:

1. **Configurar Banco de Dados - Usuários**: Execute o script [`/database/schema_usuarios_simplificado.sql`](./database/schema_usuarios_simplificado.sql)
2. **Configurar Banco de Dados - Produtos e Vendas**: Execute o script [`/database/schema_produtos_vendas.sql`](./database/schema_produtos_vendas.sql)
3. **Configurar Autenticação**: Siga o [`/auth/QUICK_START_AUTH.md`](./auth/QUICK_START_AUTH.md)
4. **Entender Schema de Produtos**: Leia [`/database/README_SCHEMA_PRODUTOS.md`](./database/README_SCHEMA_PRODUTOS.md)
5. **Entender Integrações**: Leia [`/integrations/gtin.md`](./integrations/gtin.md)

## 📖 Documentação Principal

Para informações gerais sobre o projeto, consulte o [README.md](../README.md) na raiz do projeto.

## 🆘 Precisa de Ajuda?

- **Problemas com Autenticação?** → Veja o [troubleshooting de auth](./auth/QUICK_START_AUTH.md#-troubleshooting-rápido)
- **Problemas com Banco?** → Verifique o [schema SQL](./database/schema_usuarios_simplificado.sql)
- **Problemas com GTIN?** → Consulte a [documentação GTIN](./integrations/gtin.md)

## 🏗️ Estrutura do Projeto

```
tradebox/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Rotas do dashboard
│   ├── (site)/            # Rotas públicas
│   └── api/               # API Routes
├── components/            # Componentes React
├── lib/                   # Utilitários e helpers
├── docs/                  # 📚 Documentação (você está aqui!)
│   ├── auth/             # Docs de autenticação
│   ├── integrations/     # Docs de integrações
│   └── database/         # Scripts de banco
└── README.md             # Documentação principal
```

## 📝 Contribuindo com a Documentação

Ao adicionar nova documentação:

1. Coloque em um diretório apropriado em `/docs`
2. Atualize este README.md com links
3. Use Markdown com formatação clara
4. Inclua exemplos práticos sempre que possível

---

**Projeto TradeBox** - FIAP | Desenvolvido com Next.js 15 e Oracle Database

