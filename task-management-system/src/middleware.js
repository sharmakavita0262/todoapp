import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/', '/tasks'];
const publicRoutes = ['/login', '/register'];

export function middleware(request) {
  const url = request.nextUrl.clone();
  const isLoggedIn = request.cookies.has('user');
  const path = request.nextUrl.pathname;

  // If user is logged in and tries to access login or register, redirect to /tasks
  if (isLoggedIn && (path === '/login' || path === '/register' || path === '/')) {
    url.pathname = '/tasks';
    return NextResponse.redirect(url);
  }
  console.log("isLoggedIn", isLoggedIn);
  
  // If user is not logged in and tries to access protected routes (including /), redirect to /login
  if (!isLoggedIn && protectedRoutes.includes(path)) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Allow access to public routes for unauthenticated users
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/login', '/register', '/tasks'],
};
