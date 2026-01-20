// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { hasPermission, type PermissionKey } from '@/utils/permissions';
import { User } from '@/types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-that-is-long-and-secure";

// ============================================
// ROUTE PERMISSION MAPPINGS (Billing/Invoicing App)
// ============================================
const ROUTE_PERMISSIONS: Record<string, PermissionKey[]> = {
  // Dashboard
  '/dashboard': ['VIEW_DASHBOARD'],

  // Master Data Routes
  '/master': ['MASTER_PRODUCT_VIEW'], // Base access for master menu
  '/master/user': ['MASTER_USER_MANAGE'],
  '/master/produk': ['MASTER_PRODUCT_VIEW'],
  '/master/client': ['MASTER_CLIENT_VIEW'],
  '/master/kas': ['MASTER_KAS_VIEW'],

  // Finance Routes
  '/keuangan': ['KEUANGAN_INVOICE_VIEW'], // Base access for finance menu
  '/keuangan/subscription': ['KEUANGAN_SUBSCRIPTION_VIEW'],
  '/keuangan/invoice': ['KEUANGAN_INVOICE_VIEW'],
  '/keuangan/payment': ['KEUANGAN_PAYMENT_VIEW'],
  '/keuangan/transaksiharian': ['KEUANGAN_CASHFLOW_VIEW'],

  // Report Routes
  '/laporan': ['LAPORAN_INVOICE_VIEW'], // Base access for reports
  '/laporan/invoice': ['LAPORAN_INVOICE_VIEW'],
  '/laporan/cashflow': ['LAPORAN_CASHFLOW_VIEW'],

  // Admin Routes
  '/admin': ['SUPER_ADMIN'],
  '/admin/permissions': ['SUPER_ADMIN'],
};

/**
 * Get user from session cookie by verifying the JWT
 */
function getUserFromSession(request: NextRequest): (User & { cabang_id?: number }) | null {
  try {
    const userSession = request.cookies.get('user_session')?.value;
    if (!userSession) return null;

    // Verify the JWT
    const decoded = jwt.verify(userSession, JWT_SECRET);

    // Type guard to ensure decoded is a user payload
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'role' in decoded) {
        return decoded as User;
    }

    console.warn('Invalid user session: JWT payload is malformed');
    return null;

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error:', error.message);
    } else {
      console.error('Failed to parse user session:', error);
    }
    return null;
  }
}

/**
 * Check if route requires authentication and permissions
 * API routes are excluded from middleware checks (handled by API route authentication)
 */
function isProtectedRoute(pathname: string): boolean {
  // Exclude API routes (they handle their own authentication)
  if (pathname.startsWith('/api/')) {
    return false;
  }

  // Root path should redirect based on auth status
  if (pathname === '/') {
    return false;
  }

  // Protect these frontend routes
  const protectedPaths = [
    '/dashboard',
    '/master',
    '/transaksi',
    '/gudang',
    '/persediaan',
    '/keuangan',
    '/laporan',
    '/admin',
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if user has permission to access route
 */
function hasRouteAccess(userRole: User['role'], pathname: string): boolean {
  // Find matching route permissions
  for (const [route, requiredPerms] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      // User needs AT LEAST ONE of the required permissions
      const hasAccess = requiredPerms.some(perm => 
        hasPermission(userRole, perm)
      );
      
      if (!hasAccess) {
        console.log(`Access denied: ${userRole} lacks permissions for ${route}`, {
          required: requiredPerms,
          route,
          pathname
        });
        return false;
      }
    }
  }

  return true;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    // Get user from session
    const user = getUserFromSession(request);

    // Check if route requires authentication
    if (isProtectedRoute(pathname)) {
      // Redirect to login if not authenticated
      if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check route-level permissions
      const hasAccess = hasRouteAccess(user.role, pathname);
      
      if (!hasAccess) {
        // Redirect to unauthorized page
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('path', pathname);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    // Redirect root path based on authentication status
    if (pathname === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Redirect authenticated users away from login page
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next();

    if (user) {
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-id', user.id.toString());
      if (user.cabang_id) {
        response.headers.set('x-user-branch', user.cabang_id.toString());
      }
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, still protect sensitive routes
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_error');
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
    
