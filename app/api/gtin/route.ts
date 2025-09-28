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
  const codigo = searchParams.get('codigo');
  if (!codigo) {
    return NextResponse.json({ error: 'Código não informado.' }, { status: 400 });
  }

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
    console.log('Erro na consulta GTIN:', response);
    return NextResponse.json({ error: 'Produto não encontrado ou erro na consulta.' }, { status: response.status });
  }

  const data = await response.json();
  let imageBase64 = null;

  if (data.link_foto) {
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
  }

  return NextResponse.json({ ...data, imageBase64 }, { status: 200 });
}

