import { NextResponse } from 'next/server';
import { UserCreate } from '@/app/lib/types';

export async function POST(req: Request) {
  const body: UserCreate = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return new NextResponse(JSON.stringify(errorData), { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}