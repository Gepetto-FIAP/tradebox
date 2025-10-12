import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { connectOracle } from '@/lib/db';
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

    // Conectar ao banco
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

