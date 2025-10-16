import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { connectOracle } from '@/lib/db';
import { RegisterData, AuthResponse, UserCategory, PersonType } from '@/lib/types';
import { createToken, setAuthCookie, getRedirectUrl } from '@/lib/auth';

const oracledb = require('oracledb');

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json() as RegisterData;
    
    // Validações básicas
    if (!body.email || !body.password || !body.nome || !body.categoria || 
        !body.tipo_pessoa || !body.documento) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    // Validação: Indústrias devem ter CNPJ (PJ)
    if (body.categoria === 'industry' && body.tipo_pessoa !== 'PJ') {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Indústrias devem ser cadastradas como Pessoa Jurídica (CNPJ)' },
        { status: 400 }
      );
    }

    // Validação de formato de documento
    const documentoNumeros = body.documento.replace(/\D/g, '');
    if (body.tipo_pessoa === 'PF' && documentoNumeros.length !== 11) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'CPF deve ter 11 dígitos' },
        { status: 400 }
      );
    }
    if (body.tipo_pessoa === 'PJ' && documentoNumeros.length !== 14) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'CNPJ deve ter 14 dígitos' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    connection = await connectOracle();

    // Verificar se email já existe
    const emailCheck = await connection.execute(
      'SELECT COUNT(*) as count FROM usuarios WHERE email = :email',
      { email: body.email.toLowerCase() }
    );
    
    if (emailCheck.rows && emailCheck.rows[0] && (emailCheck.rows[0] as any)[0] > 0) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se documento já existe
    const docCheck = await connection.execute(
      'SELECT COUNT(*) as count FROM usuarios WHERE documento = :documento',
      { documento: documentoNumeros }
    );
    
    if (docCheck.rows && docCheck.rows[0] && (docCheck.rows[0] as any)[0] > 0) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Este documento já está cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await hash(body.password, 10);

    // Formatar telefone (apenas números)
    const telefoneNumeros = body.telefone ? body.telefone.replace(/\D/g, '') : null;

    // Inserir usuário
    const result = await connection.execute(
      `INSERT INTO usuarios (
        email, password_hash, nome, categoria, tipo_pessoa, 
        documento, telefone, endereco, ativo
      ) VALUES (
        :email, :password_hash, :nome, :categoria, :tipo_pessoa,
        :documento, :telefone, :endereco, 'Y'
      ) RETURNING id INTO :id`,
      {
        email: body.email.toLowerCase(),
        password_hash: passwordHash,
        nome: body.nome,
        categoria: body.categoria,
        tipo_pessoa: body.tipo_pessoa,
        documento: documentoNumeros,
        telefone: telefoneNumeros,
        endereco: body.endereco || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    // Obter o ID do usuário inserido
    const userId = (result.outBinds as any).id[0];

    // Criar token JWT
    const token = await createToken({
      userId,
      email: body.email.toLowerCase(),
      categoria: body.categoria,
      nome: body.nome
    });

    // Definir cookie
    await setAuthCookie(token);

    // Retornar sucesso com redirecionamento
    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: userId,
        email: body.email.toLowerCase(),
        nome: body.nome,
        categoria: body.categoria
      },
      redirectUrl: getRedirectUrl(body.categoria)
    });

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao realizar cadastro';
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

