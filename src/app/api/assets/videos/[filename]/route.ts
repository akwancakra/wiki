import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(
      process.cwd(),
      "public",
      "assets",
      "videos",
      filename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Get content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "video/mp4";

    switch (ext) {
      case ".mp4":
        contentType = "video/mp4";
        break;
      case ".webm":
        contentType = "video/webm";
        break;
      case ".ogg":
        contentType = "video/ogg";
        break;
      case ".mov":
        contentType = "video/quicktime";
        break;
      case ".avi":
        contentType = "video/x-msvideo";
        break;
      default:
        contentType = "video/mp4";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
