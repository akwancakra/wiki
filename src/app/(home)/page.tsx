import Link from "next/link";
import {
  Search,
  FileText,
  Clock,
  ArrowRight,
  Shield,
  BookOpen,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeSearchCTA } from "./_components/home-search-cta";
import { getLatestMDXFiles } from "@/lib/mdx-utils";
import { AdminButtons } from "./_components/admin-buttons";

// Force dynamic rendering untuk latest docs
export const dynamic = "force-dynamic";

interface DocFile {
  title: string;
  description: string;
  slug: string[];
  href: string;
  lastModified: string; // ISO string format
}

async function getLatestDocs(): Promise<DocFile[]> {
  try {
    // Get latest MDX files directly from filesystem - more efficient than API call
    const latestFiles = await getLatestMDXFiles(4);

    // Convert to our DocFile format
    const docs: DocFile[] = latestFiles.map((file) => ({
      title: file.data.title,
      description: file.data.description,
      slug: file.slug,
      href: file.url,
      lastModified: file.lastModified.toISOString(),
    }));

    return docs;
  } catch (error) {
    // Return empty array instead of failing completely
    return [];
  }
}

export default async function HomePage() {
  // Get latest docs server-side via API
  const latestDocs = await getLatestDocs();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-blue-600 mr-4" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cys Wiki
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Complete cybersecurity guide for your organization. Find
          documentation, policies, and best practices in one place.
        </p>

        {/* Large Search CTA */}
        <HomeSearchCTA />

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button asChild size="lg">
            <Link href="/docs">
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Wiki
            </Link>
          </Button>
          <AdminButtons />
        </div>
      </div>

      {/* Latest Documents Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Clock className="h-6 w-6 mr-2 text-blue-600" />
            Latest Wiki
          </h2>
          {/* <Button asChild variant="ghost">
            <Link href="/docs">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestDocs.length > 0 ? (
            latestDocs.map((doc, index) => (
              <Link href={doc.href} key={index}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {doc.description || "No description available"}
                        </CardDescription>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-2 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>
                          {doc.href.replace("/docs/", "").replace("/", " / ") ||
                            "Root"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(doc.lastModified)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No wiki available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <CardTitle>Integrated Security</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Complete wiki on cybersecurity, policies, and standard procedures.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Search className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <CardTitle>Smart Search</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find the information you need with powerful and fast search
              features.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Edit3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <CardTitle>Integrated Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create and edit wiki easily using a user-friendly editor.
            </CardDescription>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
