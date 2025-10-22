# 🚪 LogoutButton Component# 🚪 LogoutButton Component



Componente de logout reutilizável para o TradeBox com confirmação e redirecionamento automático.Componente de logout reutilizável para o TradeBox com confirmação e redirecionamento automático.



## 📋 Descrição## 📋 Descrição



Botão que realiza o logout do usuário, chamando a API de logout e redirecionando para a página de login.Botão que realiza o logout do usuário, chamando a API de logout e redirecionando para a página de login.



## 🎨 Variantes## 🎨 Variantes



O componente oferece 3 variantes visuais:O componente oferece 3 variantes visuais:



### 1. **Full** (Padrão)### 1. **Full** (Padrão)

Mostra ícone + texto "Sair"Mostra ícone + texto "Sair"

```tsx```tsx

<LogoutButton variant="full" /><LogoutButton variant="full" />

``````



### 2. **Icon**### 2. **Icon**

Mostra apenas o íconeMostra apenas o ícone

```tsx```tsx

<LogoutButton variant="icon" /><LogoutButton variant="icon" />

``````



### 3. **Text**### 3. **Text**

Mostra apenas o textoMostra apenas o texto "Sair"

```tsx```tsx

<LogoutButton variant="text" /><LogoutButton variant="text" />

``````



## 🚀 Uso## 🚀 Uso



### Importação### Importação

```tsx```tsx

import LogoutButton from "@/components/LogoutButton/LogoutButton";import LogoutButton from "@/components/LogoutButton/LogoutButton";

``````



### Exemplos### Exemplos



#### Básico#### Básico

```tsx```tsx

<LogoutButton /><LogoutButton />

``````



#### Com variante customizada#### Com variante customizada

```tsx```tsx

<LogoutButton variant="icon" /><LogoutButton variant="icon" />

``````



#### Com classe customizada#### Com classe customizada

```tsx```tsx

<LogoutButton variant="full" className="minha-classe" /><LogoutButton variant="full" className="minha-classe" />

``````



## 🔧 Props## 🔧 Props



| Prop | Tipo | Padrão | Descrição || Prop | Tipo | Padrão | Descrição |

|------|------|--------|-----------||------|------|--------|-----------|

| `variant` | `'icon' \| 'text' \| 'full'` | `'full'` | Estilo visual do botão || `variant` | `'icon' \| 'text' \| 'full'` | `'full'` | Estilo visual do botão |

| `className` | `string` | `''` | Classe CSS adicional || `className` | `string` | `''` | Classe CSS adicional |



## 📱 Comportamento## 📱 Comportamento



1. **Clique no botão** → Abre confirmação1. **Clique no botão** → Abre confirmação

2. **Usuário confirma** → Chama API `/api/auth/logout`2. **Usuário confirma** → Chama API `/api/auth/logout`

3. **API retorna sucesso** → Redireciona para `/auth/login`3. **API retorna sucesso** → Redireciona para `/auth/login`

4. **Erro** → Mostra mensagem e mantém usuário na página4. **Erro** → Mostra mensagem e mantém usuário na página



## 🎯 Fluxo de Logout## 🎯 Fluxo de Logout



```mermaid```mermaid

graph TDgraph TD

    A[Usuário clica no botão] --> B{Confirma logout?}    A[Usuário clica no botão] --> B{Confirma logout?}

    B -->|Não| C[Cancela operação]    B -->|Não| C[Cancela operação]

    B -->|Sim| D[Chama API /api/auth/logout]    B -->|Sim| D[Chama API /api/auth/logout]

    D --> E{Sucesso?}    D --> E{Sucesso?}

    E -->|Sim| F[Remove cookie]    E -->|Sim| F[Remove cookie]

    F --> G[Redireciona para /auth/login]    F --> G[Redireciona para /auth/login]

    E -->|Não| H[Mostra erro]    E -->|Não| H[Mostra erro]

    H --> I[Usuário permanece na página]    H --> I[Usuário permanece na página]

``````



## 🎨 Estilos## 🎨 Estilos



### Estados do Botão### Estados do Botão



- **Normal**: Fundo vermelho translúcido- **Normal**: Fundo vermelho translúcido

- **Hover**: Fundo mais intenso + elevação- **Hover**: Fundo mais intenso + elevação

- **Active**: Remove elevação- **Active**: Remove elevação

- **Disabled**: Opacidade reduzida + cursor não permitido- **Disabled**: Opacidade reduzida + cursor não permitido

- **Loading**: Texto muda para "Saindo..."- **Loading**: Texto muda para "Saindo..."



### Cores### Cores



- **Cor base**: `#ff3b30` (vermelho)- **Cor base**: `#ff3b30` (vermelho)

- **Fundo**: `rgba(255, 59, 48, 0.1)`- **Fundo**: `rgba(255, 59, 48, 0.1)`

- **Hover**: `rgba(255, 59, 48, 0.2)`- **Hover**: `rgba(255, 59, 48, 0.2)`



## 📐 Responsividade## 📐 Responsividade



O componente é totalmente responsivo:O componente é totalmente responsivo:



- **Desktop**: Padding 10px 16px, fonte 14px- **Desktop**: Padding 10px 16px, fonte 14px

- **Mobile** (< 768px): Padding 8px 12px, fonte 13px- **Mobile** (< 768px): Padding 8px 12px, fonte 13px



## 🔐 Segurança## 🔐 Segurança



- ✅ Confirmação antes do logout- ✅ Confirmação antes do logout

- ✅ Desabilita botão durante loading- ✅ Desabilita botão durante loading

- ✅ Remove cookie de autenticação via API- ✅ Remove cookie de autenticação via API

- ✅ Redireciona automaticamente após logout- ✅ Redireciona automaticamente após logout

- ✅ Trata erros graciosamente- ✅ Trata erros graciosamente



## 🎯 Onde está sendo usado## 🎯 Onde está sendo usado



- `/app/(dashboard)/seller/layout.tsx` - Header do dashboard de varejista- `/app/(dashboard)/seller/layout.tsx` - Header do dashboard de varejista

- `/app/(dashboard)/industry/layout.tsx` - Header do dashboard de indústria- `/app/(dashboard)/industry/layout.tsx` - Header do dashboard de indústria



## 🧪 Testando## 🧪 Testando



1. Faça login no sistema1. Faça login no sistema

2. Navegue para qualquer dashboard (`/seller` ou `/industry`)2. Navegue para qualquer dashboard (`/seller` ou `/industry`)

3. Clique no botão "Sair" no header3. Clique no botão "Sair" no header

4. Confirme o logout4. Confirme o logout

5. Verifique se foi redirecionado para `/auth/login`5. Verifique se foi redirecionado para `/auth/login`



## 🐛 Troubleshooting## 🐛 Troubleshooting



### Botão não aparece### Botão não aparece

- Verifique se o componente foi importado corretamente- Verifique se o componente foi importado corretamente

- Confirme que o layout está renderizando o componente- Confirme que o layout está renderizando o componente



### Logout não funciona### Logout não funciona

- Verifique se a API `/api/auth/logout` está funcionando- Verifique se a API `/api/auth/logout` está funcionando

- Confirme que o cookie de autenticação existe- Confirme que o cookie de autenticação existe

- Veja o console do navegador para erros- Veja o console do navegador para erros



### Não redireciona após logout### Não redireciona após logout

- Verifique se `window.location.href` está funcionando- Verifique se `window.location.href` está funcionando

- Confirme que a rota `/auth/login` existe- Confirme que a rota `/auth/login` existe



## 💡 Dicas## 💡 Dicas



### Customizar cores### Customizar cores

Sobrescreva as classes CSS:Sobrescreva as classes CSS:



```css```css

.meuBotaoLogout {.meuBotaoLogout {

  background: rgba(0, 0, 255, 0.1);  background: rgba(0, 0, 255, 0.1);

  color: blue;  color: blue;

}}



.meuBotaoLogout:hover {.meuBotaoLogout:hover {

  background: rgba(0, 0, 255, 0.2);  background: rgba(0, 0, 255, 0.2);

}}

``````



### Mudar texto### Mudar texto

Edite o componente diretamente em `LogoutButton.tsx`:Edite o componente diretamente em `LogoutButton.tsx`:



```tsx```tsx

<span className={styles.text}><span className={styles.text}>

  {isLoading ? 'Saindo...' : 'Sair da Conta'}  {isLoading ? 'Saindo...' : 'Sair da Conta'}

</span></span>

``````



### Remover confirmação### Remover confirmação

Comente ou remova estas linhas:Comente ou remova estas linhas:



```tsx```tsx

// const confirmLogout = window.confirm('Deseja realmente sair?');// const confirmLogout = window.confirm('Deseja realmente sair?');

// if (!confirmLogout) return;// if (!confirmLogout) return;

``````



## 🔄 Atualização Futura## 🔄 Atualização Futura



Possíveis melhorias:Possíveis melhorias:



- [ ] Adicionar animação de fade out- [ ] Adicionar animação de fade out

- [ ] Suporte a callback customizado- [ ] Suporte a callback customizado

- [ ] Integração com sistema de notificações- [ ] Opção de logout sem confirmação

- [ ] Opção de logout silencioso (sem confirmação)- [ ] Toast notification em vez de alert
- [ ] Suporte a i18n (internacionalização)
- [ ] Analytics tracking de logout

---

**Desenvolvido para TradeBox** 🚀

