import { connectOracle } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connection = await connectOracle();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();
    return NextResponse.json({ result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}