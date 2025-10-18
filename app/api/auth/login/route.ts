import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { connectOracle, isDatabaseConfigured, findMockUserByEmail } from '@/lib/db';
import { LoginData, AuthResponse, UserCategory } from '@/lib/types';
import { createToken, setAuthCookie, getRedirectUrl } from '@/lib/auth';

const oracledb = require('oracledb');

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json() as LoginData;
    
    // Validações básicas
    if (!body.email || !body.password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se banco está configurado
    if (!isDatabaseConfigured()) {
      console.log('MODO DEMONSTRAÇÃO: Usando dados mock');
      console.log('Email recebido:', body.email);
      console.log('Senha recebida:', body.password);
      
      // Buscar usuário nos dados mock
      const mockUser = findMockUserByEmail(body.email);
      console.log('👤 Usuário encontrado:', mockUser ? 'SIM' : 'NÃO');
      
      if (!mockUser) {
        console.log('❌ Usuário não encontrado nos dados mock');
        return NextResponse.json<AuthResponse>(
          { success: false, message: 'Email ou senha incorretos. Use: demo@varejista.com ou demo@industria.com' },
          { status: 401 }
        );
      }

      console.log('🔐 Verificando senha...');
      console.log('Hash armazenado:', mockUser.PASSWORD_HASH);
      
      // Verificar senha (password123 para ambos)
      const passwordMatch = await compare(body.password, mockUser.PASSWORD_HASH);
      console.log('✅ Senha confere:', passwordMatch ? 'SIM' : 'NÃO');
      
      if (!passwordMatch) {
        console.log('❌ Senha incorreta');
        return NextResponse.json<AuthResponse>(
          { success: false, message: 'Email ou senha incorretos. Senha: password123' },
          { status: 401 }
        );
      }

      console.log('🎉 Login bem-sucedido!');
      
      // Criar token JWT
      const token = await createToken({
        userId: mockUser.ID,
        email: mockUser.EMAIL,
        categoria: mockUser.CATEGORIA as UserCategory,
        nome: mockUser.NOME
      });

      // Definir cookie
      await setAuthCookie(token);

      // Retornar sucesso com redirecionamento
      return NextResponse.json<AuthResponse>({
        success: true,
        message: '🎭 Login realizado com sucesso (MODO DEMONSTRAÇÃO)!',
        user: {
          id: mockUser.ID,
          email: mockUser.EMAIL,
          nome: mockUser.NOME,
          categoria: mockUser.CATEGORIA as UserCategory
        },
        redirectUrl: getRedirectUrl(mockUser.CATEGORIA as UserCategory)
      });
    }

    // Conectar ao banco (modo normal)
    connection = await connectOracle();

    // Buscar usuário por email
    const result = await connection.execute(
      `SELECT id, email, password_hash, nome, categoria, ativo 
       FROM usuarios 
       WHERE email = :email`,
      { email: body.email.toLowerCase() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const user = result.rows[0] as any;

    // Verificar se a conta está ativa
    if (user.ATIVO !== 'Y') {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 403 }
      );
    }

    // Verificar senha
    const passwordMatch = await compare(body.password, user.PASSWORD_HASH);
    
    if (!passwordMatch) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Criar token JWT
    const token = await createToken({
      userId: user.ID,
      email: user.EMAIL,
      categoria: user.CATEGORIA as UserCategory,
      nome: user.NOME
    });

    // Definir cookie
    await setAuthCookie(token);

    // Retornar sucesso com redirecionamento
    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user.ID,
        email: user.EMAIL,
        nome: user.NOME,
        categoria: user.CATEGORIA as UserCategory
      },
      redirectUrl: getRedirectUrl(user.CATEGORIA as UserCategory)
    });

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao realizar login';
    return NextResponse.json<AuthResponse>(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

