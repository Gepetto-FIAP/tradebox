import { NextRequest, NextResponse } from 'next/server';
import { requireIndustria } from '@/lib/api-middleware';
import { connectOracle } from '@/lib/db';
import oracledb from 'oracledb';
import { UpdatePrecoCustoRequest } from '@/lib/types';

/**
 * PATCH /api/industry/products/[id]/price
 * Atualiza o preço de custo de um produto
 * Apenas a indústria associada ao produto pode atualizar
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação e autorização
    const authResult = await requireIndustria();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { industriaId } = authResult;
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'ID do produto inválido' },
        { status: 400 }
      );
    }

    const body: UpdatePrecoCustoRequest = await request.json();
    const { preco_custo } = body;

    // Validações
    if (preco_custo === undefined || preco_custo === null) {
      return NextResponse.json(
        { success: false, error: 'preco_custo é obrigatório' },
        { status: 400 }
      );
    }

    if (typeof preco_custo !== 'number' || preco_custo < 0) {
      return NextResponse.json(
        { success: false, error: 'preco_custo deve ser um número maior ou igual a zero' },
        { status: 400 }
      );
    }

    const connection = await connectOracle();

    try {
      // Verificar se produto existe e pertence à indústria
      const checkResult = await connection.execute(
        `SELECT 
          p.id, 
          p.nome, 
          p.preco_base,
          p.industria_id
        FROM produtos p
        WHERE p.id = :product_id
          AND p.ativo = 'Y'`,
        { product_id: productId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!checkResult.rows || checkResult.rows.length === 0) {
        await connection.close();
        return NextResponse.json(
          { success: false, error: 'Produto não encontrado' },
          { status: 404 }
        );
      }

      const product = checkResult.rows[0] as any;

      // Verificar se a indústria é dona do produto
      if (product.INDUSTRIA_ID !== industriaId) {
        await connection.close();
        return NextResponse.json(
          { 
            success: false, 
            error: 'Acesso negado',
            message: 'Você só pode atualizar o preço de custo dos seus próprios produtos'
          },
          { status: 403 }
        );
      }

      // Validação de negócio: preço de custo não pode ser maior que preço base
      if (preco_custo > product.PRECO_BASE) {
        await connection.close();
        return NextResponse.json(
          { 
            success: false, 
            error: 'Validação falhou',
            message: `Preço de custo (R$ ${preco_custo.toFixed(2)}) não pode ser maior que o preço base (R$ ${product.PRECO_BASE.toFixed(2)})`
          },
          { status: 400 }
        );
      }

      // Atualizar apenas o preco_custo
      const updateResult = await connection.execute(
        `UPDATE produtos 
        SET preco_custo = :preco_custo,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :product_id`,
        {
          preco_custo,
          product_id: productId
        },
        { autoCommit: true }
      );

      if (updateResult.rowsAffected === 0) {
        await connection.close();
        return NextResponse.json(
          { success: false, error: 'Falha ao atualizar produto' },
          { status: 500 }
        );
      }

      // Buscar produto atualizado com margem calculada
      const updatedResult = await connection.execute(
        `SELECT 
          p.id,
          p.nome,
          p.gtin,
          p.preco_base,
          p.preco_custo,
          p.preco_base - p.preco_custo as lucro_unitario,
          CASE 
            WHEN p.preco_custo > 0 THEN 
              ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2)
            ELSE 0 
          END as margem_percentual,
          u.nome as vendedor_nome
        FROM produtos p
        LEFT JOIN usuarios u ON p.vendedor_id = u.id
        WHERE p.id = :product_id`,
        { product_id: productId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const updatedProduct = updatedResult.rows?.[0] as any;

      await connection.close();

      return NextResponse.json({
        success: true,
        message: 'Preço de custo atualizado com sucesso',
        product: {
          id: updatedProduct.ID,
          nome: updatedProduct.NOME,
          gtin: updatedProduct.GTIN,
          preco_base: updatedProduct.PRECO_BASE,
          preco_custo: updatedProduct.PRECO_CUSTO,
          lucro_unitario: updatedProduct.LUCRO_UNITARIO,
          margem_percentual: updatedProduct.MARGEM_PERCENTUAL,
          vendedor_nome: updatedProduct.VENDEDOR_NOME
        }
      });

    } catch (error: any) {
      await connection.close();
      throw error;
    }

  } catch (error: any) {
    console.error('Erro ao atualizar preço de custo:', error);

    // Tratamento de erros específicos do Oracle
    if (error.errorNum === 2290) {
      return NextResponse.json(
        { success: false, error: 'Validação falhou', message: 'Preço de custo não pode ser negativo' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar preço de custo', message: error.message },
      { status: 500 }
    );
  }
}

