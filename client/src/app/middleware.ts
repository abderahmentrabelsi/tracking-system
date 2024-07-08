import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as jwt.JwtPayload;
    const { Username } = decodedToken;
    const usernameFromUrl = req.nextUrl.pathname.split('/').pop();

    if (usernameFromUrl !== Username) {
      return NextResponse.redirect(new URL('/forbidden', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: '/account-settings/:username*',
};
