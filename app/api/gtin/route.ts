import { NextResponse } from 'next/server';

let bearerToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getBearerToken() {
  if (!bearerToken || Date.now() > tokenExpiresAt) {
    const basicAuth = Buffer.from(`${process.env.GTIN_USERNAME}:${process.env.GTIN_PASSWORD}`).toString("base64");
    console.log("Basic Auth Token:", basicAuth);
    const res = await fetch("https://gtin.rscsistemas.com.br/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      }
    });
    const data = await res.json();
    tokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hora
    bearerToken = data.token;
  }
  return bearerToken;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo') || searchParams.get('code');
  if (!codigo) {
    return NextResponse.json({ 
      success: false,
      error: 'Código não informado.' 
    }, { status: 400 });
  }

  try {
    const token = await getBearerToken();

    let response = await fetch(`https://gtin.rscsistemas.com.br/api/gtin/infor/${codigo}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'GET'
    });

    if (response.status === 401) {
      bearerToken = null;
      const newToken = await getBearerToken();
      response = await fetch(`https://gtin.rscsistemas.com.br/api/gtin/infor/${codigo}`, {
        headers: { 
          Authorization: `Bearer ${newToken}` 
        }
      });
    }

    if (!response.ok) {
      console.log('Erro na consulta GTIN:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false,
        error: 'Produto não encontrado na base GTIN.' 
      }, { status: 404 });
    }

    const data = await response.json();
    
    // Mapear para formato esperado pelo frontend
    const product = {
      gtin: data.gtin || codigo,
      nome: data.descricao || data.nome || '',
      descricao: data.descricao_detalhada || data.descricao || '',
      marca: data.marca || '',
      categoria: data.categoria || ''
    };

    let imageBase64 = null;

    if (data.link_foto) {
      try {
        const imgRes = await fetch(data.link_foto, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          imageBase64 = `data:image/jpeg;base64,${base64}`;
        }
      } catch (imgError) {
        console.error('Erro ao buscar imagem:', imgError);
      }
    }

    return NextResponse.json({ 
      success: true,
      product: {
        ...product,
        imageBase64
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro na API GTIN:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erro ao consultar API GTIN.' 
    }, { status: 500 });
  }
}

