# Guia de Testes - CameraScanner

## ✅ Checklist de Testes

### 1. Testes Funcionais Básicos

#### Desktop (Chrome/Edge)
- [ ] Abre o modal do scanner
- [ ] Solicita permissão de câmera
- [ ] Exibe preview da câmera
- [ ] Detecta código de barras EAN-13
- [ ] Detecta código de barras Code-128
- [ ] Fecha modal ao clicar no X
- [ ] Fecha modal ao clicar fora (overlay)
- [ ] Chama callback `onDetected` com código correto

#### Desktop (Firefox)
- [ ] Solicita permissão de câmera
- [ ] Preview da câmera funciona
- [ ] Detecção de códigos funciona
- [ ] Modal fecha corretamente

#### Desktop (Safari)
- [ ] Funciona com HTTPS
- [ ] Solicita permissão corretamente
- [ ] Detecção funciona

#### Mobile (Chrome Android)
- [ ] Usa câmera traseira por padrão
- [ ] Preview fullscreen
- [ ] Detecção rápida
- [ ] Vibração ao detectar código
- [ ] Orientação portrait funciona
- [ ] Orientação landscape funciona

#### Mobile (Safari iOS)
- [ ] Solicita permissão
- [ ] Câmera traseira por padrão
- [ ] Detecção funciona
- [ ] Modal responsivo

### 2. Testes de Erro

- [ ] Permissão negada → Exibe mensagem clara
- [ ] Nenhuma câmera → Exibe erro apropriado
- [ ] Câmera em uso → Exibe mensagem de conflito
- [ ] Erro genérico → Exibe opção de tentar novamente
- [ ] Botão "Tentar Novamente" funciona

### 3. Testes de UX

- [ ] Loading state durante solicitação de permissão
- [ ] Animação do scanner visível
- [ ] Overlay de moldura bem posicionado
- [ ] Instruções claras para o usuário
- [ ] Feedback visual ao detectar código
- [ ] Transição suave ao fechar

### 4. Testes de Performance

- [ ] Scanner inicia em < 2 segundos
- [ ] Detecção ocorre em < 1 segundo (código nítido)
- [ ] Não trava o navegador
- [ ] Stream de vídeo para ao fechar
- [ ] Sem memory leaks após múltiplas aberturas

### 5. Testes de Integração

#### No AddProductForm
- [ ] Botão "Usar Câmera" abre o scanner
- [ ] Código detectado preenche campo GTIN
- [ ] Busca automática na API GTIN funciona
- [ ] Formulário é preenchido corretamente
- [ ] Fluxo completo até cadastro funciona

### 6. Testes de Acessibilidade

- [ ] Botão de fechar tem aria-label
- [ ] Modal pode ser fechado com ESC
- [ ] Mensagens de erro são lidas por screen readers
- [ ] Contraste de texto adequado
- [ ] Focus trap no modal

## 🧪 Cenários de Teste

### Cenário 1: Happy Path (Mobile)

```
1. Abrir app no celular (HTTPS)
2. Ir para "Seller Store"
3. Clicar em "Adicionar Produto"
4. Clicar em "Usar Câmera"
5. Permitir acesso à câmera
6. Ver preview da câmera traseira
7. Posicionar código de barras na moldura
8. Ver animação de scan
9. Sentir vibração ao detectar
10. Ver modal fechar automaticamente
11. Ver código preenchido no formulário
12. Ver dados do produto carregados (se encontrado)
13. Completar cadastro
```

**Resultado Esperado**: Produto cadastrado com sucesso

### Cenário 2: Permissão Negada

```
1. Abrir scanner
2. Negar permissão de câmera
3. Ver mensagem de erro clara
4. Clicar em "Tentar Novamente"
5. Permitir permissão
6. Ver scanner funcionando
```

**Resultado Esperado**: Scanner funciona após permitir

### Cenário 3: Código Não Encontrado na API

```
1. Escanear código não registrado na API GTIN
2. Ver formulário abrir com GTIN preenchido
3. Campos nome/descrição vazios
4. Preencher manualmente
5. Cadastrar produto
```

**Resultado Esperado**: Cadastro manual funciona

### Cenário 4: Produto Já Cadastrado

```
1. Escanear código de produto já cadastrado
2. Ver mensagem de erro
3. Modal permanece aberto
4. Opção de escanear outro código
```

**Resultado Esperado**: Erro claro e possibilidade de continuar

### Cenário 5: Múltiplos Códigos em Sequência

```
1. Escanear código A
2. Cadastrar produto A
3. Abrir scanner novamente
4. Escanear código B
5. Cadastrar produto B
6. Repetir para código C
```

**Resultado Esperado**: Todos os produtos cadastrados corretamente

## 🔍 Tipos de Código de Barras para Testar

### Códigos Comuns
- **EAN-13**: 7894900011517 (Coca-Cola)
- **EAN-8**: 87365264
- **UPC-A**: 012345678905
- **Code-128**: ABC-abc-1234

### Ferramentas para Gerar Códigos

1. **Online**: https://barcode.tec-it.com/
2. **Apps**: Barcode Generator (iOS/Android)
3. **Produtos Reais**: Use produtos da sua casa

## 📱 Dispositivos para Testar

### Prioridade Alta
- [ ] iPhone 12+ (Safari)
- [ ] Samsung Galaxy S21+ (Chrome)
- [ ] Desktop Windows (Chrome)
- [ ] Desktop macOS (Safari)

### Prioridade Média
- [ ] iPad (Safari)
- [ ] Tablet Android (Chrome)
- [ ] Desktop Linux (Firefox)

### Prioridade Baixa
- [ ] Dispositivos mais antigos (iOS 13, Android 9)

## 🐛 Bugs Conhecidos e Limitações

### Limitações do Navegador
- Safari requer HTTPS (incluindo localhost)
- Alguns Android antigos têm detecção mais lenta
- Firefox mobile pode ter problemas com câmera traseira

### Limitações Físicas
- Códigos muito pequenos (< 3cm) são difíceis de detectar
- Iluminação baixa afeta a detecção
- Códigos danificados podem não ser detectados
- Ângulo muito inclinado dificulta

## 🛠️ Troubleshooting Durante Testes

### Câmera Não Abre
1. Verificar se está em HTTPS
2. Verificar permissões do navegador
3. Fechar outras abas/apps que usam câmera
4. Verificar console para erros

### Detecção Não Funciona
1. Aumentar iluminação
2. Aproximar/afastar câmera
3. Manter código estável (não tremar)
4. Verificar se código está nítido

### Performance Ruim
1. Fechar outras abas
2. Verificar uso de CPU
3. Testar em dispositivo mais potente
4. Verificar se há memory leaks

## 📊 Métricas de Sucesso

### Critérios de Aceitação
- ✅ Taxa de detecção > 90% em boas condições
- ✅ Tempo de inicialização < 2s
- ✅ Tempo de detecção < 1s
- ✅ Taxa de erro < 5%
- ✅ Compatibilidade com 95% dos dispositivos modernos

### Como Medir
```javascript
// Adicionar temporariamente no CameraScanner.tsx

const startTime = performance.now();

// Ao detectar código
const detectionTime = performance.now() - startTime;
console.log('Detection time:', detectionTime, 'ms');

// Ao abrir câmera
const cameraStartTime = performance.now() - mountTime;
console.log('Camera start time:', cameraStartTime, 'ms');
```

## 📝 Relatório de Testes

### Template de Relatório

```markdown
## Teste: [Nome do Teste]
**Data**: [Data]
**Dispositivo**: [Dispositivo/Navegador]
**Testador**: [Nome]

### Resultado
- [ ] Passou
- [ ] Falhou
- [ ] Bloqueado

### Observações
[Descrever o que aconteceu]

### Screenshots/Vídeos
[Anexar se aplicável]

### Bugs Encontrados
1. [Bug 1]
2. [Bug 2]
```

## ✨ Melhorias Sugeridas Após Testes

Com base nos testes, considerar:

- [ ] Adicionar tutorial na primeira vez
- [ ] Melhorar feedback visual
- [ ] Adicionar controle de zoom
- [ ] Suportar torch/flash
- [ ] Cache de permissões
- [ ] Retry automático em falhas
- [ ] Analytics de uso

## 🎯 Próximos Passos

1. Executar todos os testes do checklist
2. Documentar bugs encontrados
3. Priorizar correções
4. Implementar melhorias
5. Repetir ciclo de testes

---

**Nota**: Testes devem ser executados em ambiente de staging com HTTPS antes de deploy em produção.

