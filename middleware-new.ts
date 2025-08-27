import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("=== Middleware jalan di:", req.nextUrl.pathname);
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Jika sudah login dan mencoba akses halaman login, redirect ke dashboard
    if (token && pathname === "/login") {
      console.log("User sudah login, redirect dari /login ke /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Public routes yang bisa diakses tanpa login
    const publicRoutes = ["/", "/login", "/api/auth"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname.startsWith(route) || pathname === "/"
    );

    // Jika user belum login dan mencoba akses protected route
    if (!token && !isPublicRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (token) {
      const userRole = token.role as string;

      // Admin routes - hanya admin yang bisa akses
      const adminRoutes = ["/admin", "/editor"];
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isAdminRoute && userRole !== "admin") {
        // Redirect ke unauthorized page atau dashboard user
        console.log(
          `User role ${userRole} tidak bisa akses ${pathname}, redirect ke dashboard`
        );
        return NextResponse.redirect(
          new URL("/dashboard?error=unauthorized", req.url)
        );
      }

      // User routes - user dan admin bisa akses
      const userRoutes = ["/docs", "/dashboard"];
      const isUserRoute = userRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isUserRoute && !["user", "admin"].includes(userRole)) {
        console.log(`User role ${userRole} tidak valid, redirect ke login`);
        return NextResponse.redirect(
          new URL("/login?error=access-denied", req.url)
        );
      }

      // Redirect user yang sudah login dari root ke dashboard
      if (pathname === "/" && token) {
        console.log("User sudah login di root, redirect ke dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        const publicRoutes = ["/", "/login", "/api/auth"];
        const isPublicRoute = publicRoutes.some(
          (route) => pathname.startsWith(route) || pathname === "/"
        );

        if (isPublicRoute) return true;

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
