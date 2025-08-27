"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import { Search, ArrowRight, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Interface for search result from fumadocs search API (actual format)
interface SearchResult {
  id: string;
  type: "page" | "text";
  content: string;
  url: string;
  title?: string;
  description?: string;
}

// Interface for display in component
interface DisplayDoc {
  title: string;
  description: string;
  href: string;
  type: "page" | "text";
  snippet?: string;
}

export function HomeSearchCTA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DisplayDoc[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Function to extract relevant snippet from content based on search query
  const extractSnippet = (
    content: string,
    query: string,
    maxLength: number = 150
  ): string => {
    if (!content || !query) return content.substring(0, maxLength) + "...";

    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
    const contentLower = content.toLowerCase();

    // Find the first occurrence of any search term
    let bestMatch = -1;
    let bestTerm = "";

    for (const term of searchTerms) {
      const index = contentLower.indexOf(term);
      if (index !== -1 && (bestMatch === -1 || index < bestMatch)) {
        bestMatch = index;
        bestTerm = term;
      }
    }

    if (bestMatch === -1) {
      // No match found, return beginning of content
      return content.substring(0, maxLength) + "...";
    }

    // Extract snippet around the match
    const start = Math.max(0, bestMatch - 50);
    const end = Math.min(content.length, bestMatch + maxLength);
    let snippet = content.substring(start, end);

    // Clean up snippet
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    return snippet;
  };

  // Function to highlight search terms in text
  const highlightText = (text: string, query: string): JSX.Element => {
    if (!query.trim()) return <span>{text}</span>;

    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
    let highlightedText = text;

    // Replace each search term with highlighted version
    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>'
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      // setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: SearchResult[] = await response.json();

      // Transform search results to display format
      const displayResults: DisplayDoc[] = results
        .slice(0, 8) // Increase limit for better results
        .map((result) => {
          // Use title from API if available, otherwise extract from URL
          const title =
            result.title ||
            result.content ||
            (() => {
              const urlParts = result.url.split("/").filter(Boolean);
              const pageTitle = urlParts[urlParts.length - 1] || "Page";
              return pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
            })();

          // Get description and snippet from API response
          let description = result.description || "No description available";
          let snippet = "";

          // If we have content, extract relevant snippet based on search query
          if (result.content) {
            snippet = extractSnippet(result.content, query);

            // If no API description, use snippet as description
            if (!result.description || result.description === "") {
              description = snippet;
            }
          }

          return {
            title: title,
            description: description,
            href: result.url,
            type: result.type,
            snippet: snippet,
          };
        })
        // Group by URL to avoid duplicates, prefer page type over text
        .reduce((acc: DisplayDoc[], current) => {
          const existing = acc.find((item) => item.href === current.href);
          if (!existing) {
            acc.push(current);
          } else if (current.type === "page" && existing.type === "text") {
            // Replace text result with page result for better title
            const index = acc.indexOf(existing);
            acc[index] = current;
          }
          return acc;
        }, [])
        .slice(0, 6); // Final limit to 6 unique pages

      setSearchResults(displayResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/docs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8" ref={containerRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documentation, policies, or guides..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            onFocus={() => {
              if (searchQuery && searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            className="h-14 pl-12 pr-32 text-lg border-2 border-border focus:border-blue-500 rounded-xl shadow-lg"
          />
          {/* {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )} */}
          {/* <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6"
            disabled={!searchQuery.trim()}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button> */}
        </div>

        {/* Search Results Dropdown - Fixed positioning */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-auto">
            {isSearching ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Searching...
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.length} result
                    {searchResults.length > 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close search results"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Separator className="my-2" />
                {searchResults.map((doc, index) => (
                  <Link
                    key={index}
                    href={doc.href}
                    className="text-start block p-3 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                      <div className="font-medium text-foreground">
                        {highlightText(doc.title, searchQuery)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-6 line-clamp-2">
                      {doc.snippet
                        ? highlightText(doc.snippet, searchQuery)
                        : highlightText(doc.description, searchQuery)}
                    </div>
                  </Link>
                ))}
                {/* <Separator className="my-2" />
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push(
                        `/docs?search=${encodeURIComponent(searchQuery)}`
                      );
                      setShowResults(false);
                    }}
                  >
                    View all results <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div> */}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No results found for "{searchQuery}"</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
