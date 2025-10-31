const bcrypt = require('bcryptjs');

// O hash que você tem
const hash = '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq';

// Função para criar um novo hash (para comparação)
async function criarNovoHash(senha) {
  const novoHash = await bcrypt.hash(senha, 10);
  console.log(`\n🔑 Hash para "${senha}": ${novoHash}`);
  return novoHash;
}

// Função para verificar se uma senha específica funciona
async function verificarSenha(senha) {
  try {
    const match = await bcrypt.compare(senha, hash);
    return match;
  } catch (error) {
    console.log(`❌ Erro ao verificar "${senha}": ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testador de Hash Bcrypt para TradBox\n');
  console.log(`📝 Hash fornecido: ${hash}\n`);
  
  // Lista expandida de senhas para testar
  const senhas = [
    // Senhas básicas
    '123456', 'password', 'admin', 'root', 'user', 'test',
    
    // Relacionadas ao projeto
    'tradebox', 'TradBox', 'TRADEBOX', 'fiap', 'FIAP',
    'industria', 'seller', 'industry', 'dashboard',
    
    // Combinações comuns
    'admin123', 'password123', 'tradebox123', 'fiap123',
    'user123', 'test123', 'senha123', 'admin321',
    
    // Senhas em português
    'senha', 'administrador', 'usuario', 'vendedor',
    'sistema', 'projeto', 'desenvolvimento', 'demo',
    
    // Variações numéricas
    '12345', '123456789', '1234567890', '000000', '111111',
    
    // Senhas específicas para desenvolvimento
    'dev', 'development', 'local', 'localhost',
    'debug', 'staging', 'production', 'prod'
  ];

  console.log('🔍 Testando senhas...\n');
  
  for (let i = 0; i < senhas.length; i++) {
    const senha = senhas[i];
    const match = await verificarSenha(senha);
    
    if (match) {
      console.log(`\n🎉 SUCESSO! A senha é: "${senha}"`);
      console.log(`\n✅ Use esta senha para fazer login na aplicação!`);
      console.log(`\n📧 Informações para login:`);
      console.log(`   Senha: ${senha}`);
      console.log(`   Hash:  ${hash}`);
      return;
    } else {
      process.stdout.write(`❌ ${senha.padEnd(15)} `);
      if ((i + 1) % 4 === 0) console.log('');
    }
  }
  
  console.log('\n\n😞 Nenhuma senha testada funcionou.');
  console.log('\n🔧 SOLUÇÕES ALTERNATIVAS:\n');
  
  console.log('1️⃣ CRIAR NOVO USUÁRIO COM SENHA CONHECIDA:');
  await criarNovoHash('123456');
  await criarNovoHash('admin');
  await criarNovoHash('tradebox123');
  
  console.log('\n2️⃣ VERIFICAR NO CÓDIGO:');
  console.log('   - Procure por arquivos de seed/migration no banco');
  console.log('   - Verifique scripts de inicialização');
  console.log('   - Procure por arquivos .env ou config');
  
  console.log('\n3️⃣ USAR SENHA MANUAL:');
  console.log('   Digite uma senha para testar manualmente:');
  console.log('   node -e "const bcrypt=require(\'bcryptjs\'); bcrypt.compare(\'SUA_SENHA\', \'${hash}\').then(r=>console.log(r))"');
  
  console.log('\n4️⃣ CRIAR SCRIPT DE RESET:');
  console.log('   - Conecte no banco direto');
  console.log('   - UPDATE users SET password = \'${await bcrypt.hash("123456", 10)}\' WHERE email = \'admin@tradebox.com\'');
}

main().catch(console.error);