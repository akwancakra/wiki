import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- COPIED FROM route.ts ---
function extractRequestInfo(req: any) {
  let forwarded: string | null = null;
  let realIp: string | null = null;
  let userAgent: string | null = null;
  let host: string | null = null;
  let referer: string | null = null;
  try {
    if (req && typeof req.headers?.get === "function") {
      forwarded = req.headers.get("x-forwarded-for");
      realIp = req.headers.get("x-real-ip");
      userAgent = req.headers.get("user-agent");
      host = req.headers.get("host");
      referer = req.headers.get("referer");
    } else if (req && req.headers && typeof req.headers === "object") {
      forwarded = req.headers["x-forwarded-for"] || null;
      realIp = req.headers["x-real-ip"] || null;
      userAgent = req.headers["user-agent"] || null;
      host = req.headers["host"] || null;
      referer = req.headers["referer"] || null;
    }
  } catch (error) {
    console.warn("Error extracting request info:", error);
  }
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
  const deviceInfo = parseUserAgent(userAgent || "unknown");
  return {
    ip,
    userAgent: userAgent || "unknown",
    ...deviceInfo,
    timestamp: new Date().toISOString(),
    headers: {
      forwarded,
      realIp,
      host,
      referer,
    },
  };
}

function parseUserAgent(userAgent: string) {
  const info = {
    browser: "unknown",
    os: "unknown",
    device: "unknown",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };
  if (userAgent.includes("Chrome")) info.browser = "Chrome";
  else if (userAgent.includes("Firefox")) info.browser = "Firefox";
  else if (userAgent.includes("Safari")) info.browser = "Safari";
  else if (userAgent.includes("Edge")) info.browser = "Edge";
  else if (userAgent.includes("Opera")) info.browser = "Opera";
  if (userAgent.includes("Windows")) info.os = "Windows";
  else if (userAgent.includes("Mac")) info.os = "macOS";
  else if (userAgent.includes("Linux")) info.os = "Linux";
  else if (userAgent.includes("Android")) info.os = "Android";
  else if (userAgent.includes("iOS")) info.os = "iOS";
  if (userAgent.includes("Mobile")) {
    info.isMobile = true;
    info.isDesktop = false;
    info.device = "Mobile";
  } else if (userAgent.includes("Tablet")) {
    info.isTablet = true;
    info.isDesktop = false;
    info.device = "Tablet";
  } else {
    info.device = "Desktop";
  }
  return info;
}

async function logUserLogin(
  user: any,
  requestInfo: any,
  provider: string,
  success: boolean = true
) {
  const logData = {
    event: "user_login",
    success,
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role,
    },
    provider,
    requestInfo,
    sessionId: generateSessionId(),
  };
  console.log("=== USER LOGIN LOG ===");
  console.log(JSON.stringify(logData, null, 2));
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/login-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });
    if (!response.ok) {
      console.error("Failed to save login log:", await response.text());
    } else {
      console.log("Login log saved successfully");
    }
  } catch (error) {
    console.error("Error saving login log to API:", error);
  }
  return logData;
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateDummyAdmin(username: string, password: string) {
  // Daftar akun dummy admin - hanya satu akun aktif
  const dummyAdmins = [
    {
      username: "admin",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    },
    // Akun berikut di-disable untuk keamanan
    // {
    //   username: "superadmin",
    //   password: "super123",
    //   name: "Super Admin",
    //   role: "admin",
    // },
    // {
    //   username: "testadmin",
    //   password: "test123",
    //   name: "Test Admin",
    //   role: "admin",
    // },
    {
      username: "dummy",
      password: "dummy123",
      name: "Dummy User",
      role: "user",
    },
  ];
  const foundUser = dummyAdmins.find(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() &&
      user.password === password
  );
  if (foundUser) {
    return {
      success: true,
      userData: {
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
      },
    };
  }
  return { success: false };
}

async function validateWithTelyusAPI(username: string, password: string) {
  const telyusApiUrl = "https://auth.telyus.co.id/v2/account/validate";
  const appsName = process.env.TELYUS_APPS_NAME;
  const appsToken = process.env.TELYUS_APPS_TOKEN;
  if (!appsName || !appsToken) {
    console.error("Missing Telyus API credentials in environment variables");
    return { success: false, error: "API configuration missing" };
  }
  try {
    const response = await fetch(telyusApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AppsName: appsName,
        AppsToken: appsToken,
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    const result = await response.json();
    console.log("Telyus API Response:", {
      status: response.status,
      body: result,
    });
    if (response.status === 200 && result.code === 200 && result.login === 1) {
      return {
        success: true,
        userData: { username: username, name: username },
        message: result.note,
      };
    }
    return {
      success: false,
      error: result.note || "Authentication failed",
      code: result.code,
    };
  } catch (error) {
    console.error("Error calling Telyus API:", error);
    return { success: false, error: "Network error or API unavailable" };
  }
}

function determineUserRole(identifier: string): string {
  const normalizedIdentifier = identifier.toLowerCase().trim();
  const adminList =
    process.env.ADMIN_NIKS || process.env.ADMIN_IDENTIFIERS || "";
  if (adminList) {
    const adminIdentifiers = adminList
      .split(",")
      .map((id) => id.trim().toLowerCase());
    if (adminIdentifiers.includes(normalizedIdentifier)) {
      console.log(`🔑 Admin access granted for: ${identifier}`);
      return "admin";
    }
  }
  const adminPrefixes = process.env.ADMIN_NIK_PREFIXES || "";
  if (adminPrefixes) {
    const prefixes = adminPrefixes.split(",").map((p) => p.trim());
    for (const prefix of prefixes) {
      if (normalizedIdentifier.startsWith(prefix)) {
        console.log(
          `🔑 Admin access granted via prefix ${prefix} for: ${identifier}`
        );
        return "admin";
      }
    }
  }
  const adminDomains = process.env.ADMIN_EMAIL_DOMAINS || "";
  if (adminDomains && normalizedIdentifier.includes("@")) {
    const domains = adminDomains.split(",").map((d) => d.trim().toLowerCase());
    for (const domain of domains) {
      if (
        normalizedIdentifier.includes(domain) &&
        (normalizedIdentifier.includes("admin") ||
          normalizedIdentifier.includes("superuser"))
      ) {
        console.log(
          `🔑 Admin access granted via domain ${domain} for: ${identifier}`
        );
        return "admin";
      }
    }
  }
  const emergencyAdmins = ["superadmin", "emergency@telyus.co.id"];
  if (emergencyAdmins.includes(normalizedIdentifier)) {
    console.log(`🚨 Emergency admin access granted for: ${identifier}`);
    return "admin";
  }
  console.log(`👤 User access granted for: ${identifier}`);
  return "user";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "nama@perusahaan.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const requestInfo = extractRequestInfo(req as any);
          const dummyAuthResult = validateDummyAdmin(
            credentials.email,
            credentials.password
          );
          if (dummyAuthResult.success) {
            const user = {
              id: credentials.email,
              email: credentials.email,
              name: dummyAuthResult.userData?.name || credentials.email,
              role: dummyAuthResult.userData?.role || "user",
            };
            await logUserLogin(user, requestInfo, "dummy-admin", true);
            console.log(
              `🎭 Dummy admin login successful: ${credentials.email}`
            );
            return user;
          }
          const telyusAuthResult = await validateWithTelyusAPI(
            credentials.email,
            credentials.password
          );
          if (telyusAuthResult.success) {
            const userRole = determineUserRole(credentials.email);
            const user = {
              id: credentials.email,
              email: credentials.email,
              name: telyusAuthResult.userData?.name || credentials.email,
              role: userRole,
            };
            await logUserLogin(user, requestInfo, "telyus-api", true);
            return user;
          } else {
            await logUserLogin(
              { email: credentials.email },
              requestInfo,
              "telyus-api",
              false
            );
            return null;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          await logUserLogin(
            { email: credentials.email },
            extractRequestInfo(req as any),
            "error",
            false
          );
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, user, profile }) {
      if (account?.provider === "credentials") {
        return user ? true : false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
