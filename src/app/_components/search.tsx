"use client";
import { useDocsSearch } from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const pathname = usePathname();
  const [tag, setTag] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  // Get current file path for filtering
  const getCurrentFilePath = () => {
    if (pathname.startsWith("/docs")) {
      return pathname;
    }
    return undefined;
  };

  const currentFilePath = getCurrentFilePath();

  const { search, setSearch, query } = useDocsSearch({
    tag: tag || undefined, // Convert empty string to undefined
    type: "fetch",
    locale,
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
        <SearchDialogFooter className="flex flex-row">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="border rounded px-3 py-1 flex items-center gap-1 text-sm bg-background hover:bg-accent transition"
              >
                <span className="text-xs text-muted-foreground">Filter:</span>
                <span className="text-xs">
                  {tag === currentFilePath ? "Current File" : "Full Docs"}
                </span>
                {open ? (
                  <ChevronUpIcon className="w-4 h-4 ml-1 opacity-70" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 ml-1 opacity-70" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={() => {
                  setTag("");
                  setOpen(false);
                }}
                className={tag !== currentFilePath ? "font-semibold" : ""}
              >
                <div className="flex flex-col">
                  <span>Full Docs</span>
                  <span className="text-xs text-muted-foreground">
                    Search in all documents
                  </span>
                </div>
              </DropdownMenuItem>
              {currentFilePath && (
                <DropdownMenuItem
                  onSelect={() => {
                    setTag(currentFilePath);
                    setOpen(false);
                  }}
                  className={tag === currentFilePath ? "font-semibold" : ""}
                >
                  <div className="flex flex-col">
                    <span>Current File</span>
                    <span className="text-xs text-muted-foreground">
                      Search only in this document
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
