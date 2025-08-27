import { NextRequest, NextResponse } from "next/server";
import { searchMDXFiles, getAllMDXFiles } from "@/lib/mdx-utils";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const tag = url.searchParams.get("tag");

    if (!query.trim()) {
      // If no query, return all files or filter by tag
      const allFiles = await getAllMDXFiles();

      let results = allFiles.map((file) => ({
        id: file.url,
        type: "page" as const,
        content: file.content, // Return full content for snippet extraction
        url: file.url,
        // Enhanced format for better search experience
        title: file.data.title,
        description: file.data.description,
        structuredData: {
          headings: [], // Can be expanded based on need
          sections: [],
        },
        tag: file.url,
      }));

      // Filter by tag if provided
      if (tag) {
        results = results.filter(
          (item) => item.url === tag || item.tag === tag
        );
      }

      return NextResponse.json(results);
    }

    // Perform search with query
    const searchResults = await searchMDXFiles(query);

    let results = searchResults.map((item) => ({
      id: item.id,
      type: "page" as const,
      content: item.content, // Return full content for snippet extraction
      url: item.url,
      // Enhanced format for better search experience
      title: item.title,
      description: item.description,
      structuredData: item.structuredData,
      tag: item.url,
    }));

    // Filter by tag if provided
    if (tag) {
      results = results.filter((item) => item.url === tag || item.tag === tag);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
