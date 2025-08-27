import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  const logPath = path.join(process.cwd(), "messages", "activity-log.json");
  try {
    const logContent = await fs.readFile(logPath, "utf-8");
    const logs = JSON.parse(logContent);
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
} 