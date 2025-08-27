"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogScrollableContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  Loader2,
  FolderPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import path from "path-browserify";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FileTreeNode {
  name: string;
  children?: string[];
}

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    filePath: string,
    metadata: { title: string; description: string }
  ) => Promise<void>;
  initialFileName?: string;
  initialTitle?: string;
  initialDescription?: string;
  editMode?: {
    content: string;
    metadata: {
      title?: string;
      description?: string;
    };
    filePath: string;
  };
}

interface TreeItemProps {
  nodeId: string;
  node: FileTreeNode;
  allNodes: Record<string, FileTreeNode>;
  level: number;
  selectedPath: string;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggleExpand: (path: string) => void;
  onDelete: (path: string, isFolder: boolean) => void;
  onRename: (path: string, newName: string, isFolder: boolean) => void;
  draggedItem?: string | null;
  dropIndicator?: {
    nodeId: string;
    position: "before" | "after" | "inside";
  } | null;
}

const TreeItem: React.FC<TreeItemProps> = ({
  nodeId,
  node,
  allNodes,
  level,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggleExpand,
  onDelete,
  onRename,
  draggedItem,
  dropIndicator,
}) => {
  const isFolder = !!node.children;
  const isExpanded = expandedPaths.has(nodeId);
  const isSelected = selectedPath === nodeId;
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(node.name);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Can't delete or rename root docs folder
  const isRootDocs = nodeId === "docs";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: nodeId,
    disabled: isRootDocs || isRenaming,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== node.name) {
      onRename(nodeId, newName.trim(), isFolder);
    }
    setIsRenaming(false);
    setNewName(node.name);
  };

  const handleDelete = () => {
    onDelete(nodeId, isFolder);
    setShowDeleteDialog(false);
  };

  const showDropBefore =
    dropIndicator?.nodeId === nodeId && dropIndicator?.position === "before";
  const showDropAfter =
    dropIndicator?.nodeId === nodeId && dropIndicator?.position === "after";
  const showDropInside =
    dropIndicator?.nodeId === nodeId && dropIndicator?.position === "inside";

  return (
    <>
      {/* Enhanced Drop indicator before */}
      {showDropBefore && (
        <div className="relative">
          <div
            className="h-0.5 bg-blue-500 rounded-full mx-2 my-1 shadow-lg"
            style={{ marginLeft: `${level * 20 + 16}px` }}
          >
            {/* Drop indicator dots */}
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      )}

      <div ref={setNodeRef} style={style}>
        <ContextMenu>
          <ContextMenuTrigger disabled={isRootDocs}>
            <div
              data-node-id={nodeId}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm group relative transition-all duration-200",
                isSelected && "bg-accent",
                "select-none",
                isDragging && "opacity-50 shadow-lg z-50",
                draggedItem === nodeId && "ring-2 ring-blue-500 bg-blue-50",
                showDropInside &&
                  isFolder &&
                  "bg-blue-100 ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
              )}
              style={{ paddingLeft: `${level * 20 + 8}px` }}
              onClick={() => {
                if (isRenaming) return;

                if (isFolder) {
                  onToggleExpand(nodeId);
                  onSelect(nodeId);
                } else {
                  // If file, select parent folder
                  const parentPath = nodeId.includes("/")
                    ? nodeId.substring(0, nodeId.lastIndexOf("/"))
                    : "docs";
                  onSelect(parentPath);
                }
              }}
            >
              {!isRootDocs && (
                <div
                  {...attributes}
                  {...listeners}
                  className="flex items-center justify-center w-4 h-4 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity duration-200 hover:bg-gray-200 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
              )}

              {isFolder && (
                <div className="flex items-center justify-center w-4 h-4">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                  )}
                </div>
              )}
              {!isFolder && <div className="w-4" />}

              {isFolder ? (
                isExpanded ? (
                  <FolderOpenIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <FolderIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )
              ) : (
                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}

              {isRenaming ? (
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename();
                    } else if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNewName(node.name);
                    }
                  }}
                  onBlur={handleRename}
                  className="h-6 px-1 text-xs flex-1 min-w-0"
                  autoFocus
                />
              ) : (
                <span className="truncate">{node.name}</span>
              )}

              {/* Enhanced Drop inside indicator for folders */}
              {showDropInside && isFolder && (
                <>
                  <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-sm pointer-events-none bg-blue-50/50 animate-pulse" />
                  <div className="absolute top-1 right-1 text-xs text-blue-600 font-medium pointer-events-none">
                    Drop here
                  </div>
                </>
              )}
            </div>
          </ContextMenuTrigger>

          {!isRootDocs && (
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => setIsRenaming(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Rename {isFolder ? "Folder" : "File"}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete {isFolder ? "Folder" : "File"}
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
      </div>

      {/* Enhanced Drop indicator after */}
      {showDropAfter && (
        <div className="relative">
          <div
            className="h-0.5 bg-blue-500 rounded-full mx-2 my-1 shadow-lg"
            style={{ marginLeft: `${level * 20 + 16}px` }}
          >
            {/* Drop indicator dots */}
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      )}

      {isFolder && isExpanded && node.children && (
        <SortableContext
          items={node.children}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {node.children.map((childId) => {
              const childNode = allNodes[childId];
              if (!childNode) return null;

              return (
                <TreeItem
                  key={childId}
                  nodeId={childId}
                  node={childNode}
                  allNodes={allNodes}
                  level={level + 1}
                  selectedPath={selectedPath}
                  expandedPaths={expandedPaths}
                  onSelect={onSelect}
                  onToggleExpand={onToggleExpand}
                  onDelete={onDelete}
                  onRename={onRename}
                  draggedItem={draggedItem}
                  dropIndicator={dropIndicator}
                />
              );
            })}
          </div>
        </SortableContext>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {isFolder ? "folder" : "file"} "
              {node.name}"?
              {isFolder &&
                " All files and subfolders inside it will also be deleted."}
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const DragOverlayItem = ({
  nodeId,
  items,
}: {
  nodeId: string;
  items: Record<string, FileTreeNode>;
}) => {
  const node = items[nodeId];
  if (!node) return null;

  const isFolder = !!node.children;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 text-xs bg-background/95 border border-blue-500 rounded-md shadow-lg backdrop-blur-md max-w-[140px] md:max-w-[160px] lg:max-w-[180px] drag-overlay-item"
      style={{
        minWidth: "100px",
      }}
    >
      <div className="flex items-center gap-1 opacity-70">
        {isFolder ? (
          <FolderIcon className="h-3 w-3 text-yellow-500 flex-shrink-0" />
        ) : (
          <FileIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
        )}
      </div>

      <span className="truncate font-medium text-foreground">{node.name}</span>

      <div className="text-blue-500 opacity-80 ml-auto">
        {isFolder ? "📁" : "📄"}
      </div>
    </div>
  );
};

export const SaveDialog = ({
  open,
  onOpenChange,
  onSave,
  initialFileName = "",
  initialTitle = "",
  initialDescription = "",
  editMode,
}: SaveDialogProps) => {
  const [items, setItems] = React.useState<Record<string, FileTreeNode>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [fileName, setFileName] = React.useState(initialFileName);
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);

  // Helper function to normalize paths consistently
  const normalizePath = (pathStr: string): string => {
    return pathStr.replace(/\\/g, "/");
  };

  // Set initial selectedPath based on editMode
  const getInitialSelectedPath = () => {
    if (editMode?.filePath) {
      const normalizedPath = normalizePath(editMode.filePath);
      const pathParts = normalizedPath.replace(/\.mdx$/, "").split("/");
      if (pathParts.length > 1) {
        pathParts.pop(); // Remove filename, keep folder path
        return pathParts.join("/");
      }
    }
    return "docs";
  };

  // Get initial filename (without path)
  const getInitialFileName = () => {
    if (editMode?.filePath) {
      const normalizedPath = normalizePath(editMode.filePath);
      const pathParts = normalizedPath.replace(/\.mdx$/, "").split("/");
      return pathParts[pathParts.length - 1]; // Get only the filename
    }
    return initialFileName;
  };

  const [selectedPath, setSelectedPath] = React.useState(
    getInitialSelectedPath()
  );
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(
    new Set(["docs"])
  );

  // Update states when editMode or initial values change
  React.useEffect(() => {
    setFileName(getInitialFileName());
    setTitle(initialTitle);
    setDescription(initialDescription);
    setSelectedPath(getInitialSelectedPath());
  }, [initialFileName, initialTitle, initialDescription, editMode]);

  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  const [newFolderName, setNewFolderName] = React.useState("");
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = React.useState(false);
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = React.useState<{
    nodeId: string;
    position: "before" | "after" | "inside";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchFileTree = React.useCallback(
    (preserveExpandedPaths = false) => {
      setIsLoading(true);
      fetch("/api/files")
        .then((res) => res.json())
        .then((data) => {
          if (data.tree) {
            // Normalize path separators from backslash to forward slash
            const normalizedTree: Record<string, FileTreeNode> = {};

            Object.keys(data.tree).forEach((key) => {
              const normalizedKey = normalizePath(key);
              const node = data.tree[key];

              // Normalize children paths too
              const normalizedNode = {
                ...node,
                children: node.children?.map((child: string) =>
                  normalizePath(child)
                ),
              };

              normalizedTree[normalizedKey] = normalizedNode;
            });

            setItems(normalizedTree);

            // Only reset expanded paths on initial load, preserve them on refresh
            if (!preserveExpandedPaths) {
              setExpandedPaths(new Set(["docs"]));
            }
          } else {
            throw new Error("Invalid data structure from API");
          }
        })
        .catch((err) => {
          console.error("Error fetching file tree:", err);
          toast({
            variant: "destructive",
            title: "Failed to Load Folder Structure",
            description: "Unable to fetch folder structure. Please try again.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [toast]
  );

  React.useEffect(() => {
    if (open) {
      fetchFileTree();
    }
  }, [open, fetchFileTree]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active.id as string);
    setDropIndicator(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setDropIndicator(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Can't drop to itself or to its own child
    if (activeId === overId || overId.startsWith(activeId + "/")) {
      setDropIndicator(null);
      return;
    }

    const overNode = items[overId];
    if (!overNode) {
      setDropIndicator(null);
      return;
    }

    const isOverFolder = !!overNode.children;

    // Get mouse position for better drop detection
    const { x, y } = event.delta;

    if (isOverFolder) {
      // For folders, show "inside" drop indicator
      setDropIndicator({ nodeId: overId, position: "inside" });

      // Auto expand folder on hover
      if (!expandedPaths.has(overId)) {
        setExpandedPaths((prev) => new Set([...prev, overId]));
      }
    } else {
      // For files, default to "after" position
      // This allows dropping next to files
      setDropIndicator({ nodeId: overId, position: "after" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);
    setDropIndicator(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Normalize paths to ensure consistency
    const normalizedActiveId = normalizePath(activeId);
    const normalizedOverId = normalizePath(overId);

    // Can't move root docs
    if (normalizedActiveId === "docs") {
      return;
    }

    // Can't drop to itself or to its own child
    if (
      normalizedActiveId === normalizedOverId ||
      normalizedOverId.startsWith(normalizedActiveId + "/")
    ) {
      return;
    }

    // Special handling for root docs drop
    if (normalizedOverId === "docs") {
      try {
        const response = await fetch("/api/files", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "move",
            sourcePath: normalizedActiveId,
            targetPath: "docs",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to move item");
        }

        toast({
          title: "Success",
          description: "Item moved to root docs folder successfully.",
        });

        // Refresh tree while preserving expanded paths
        await fetchFileTree(true);
        return;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to Move",
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while moving the item.",
        });
        return;
      }
    }

    const overNode = items[normalizedOverId];
    if (!overNode) {
      return;
    }

    let targetPath = "";
    const dropPosition = dropIndicator?.position;

    if (dropPosition === "inside" && overNode.children) {
      // Move inside folder
      targetPath = normalizedOverId;
    } else if (dropPosition === "before" || dropPosition === "after") {
      // Move to same level as target (next to files/folders)
      const targetParent = normalizedOverId.includes("/")
        ? normalizedOverId.substring(0, normalizedOverId.lastIndexOf("/"))
        : "docs";
      targetPath = targetParent;
    } else {
      // Fallback: if dropping on folder without specific position, move inside
      if (overNode.children) {
        targetPath = normalizedOverId;
      } else {
        // Dropping on file - move to same parent folder
        const targetParent = normalizedOverId.includes("/")
          ? normalizedOverId.substring(0, normalizedOverId.lastIndexOf("/"))
          : "docs";
        targetPath = targetParent;
      }
    }

    try {
      const response = await fetch("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          sourcePath: normalizedActiveId,
          targetPath: targetPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to move item");
      }

      toast({
        title: "Success",
        description: "Item moved successfully.",
      });

      // Refresh tree while preserving expanded paths
      await fetchFileTree(true);

      // Ensure target folder is expanded
      if (targetPath !== "docs") {
        setExpandedPaths((prev) => new Set([...prev, targetPath]));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Move",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while moving the item.",
      });
    }
  };

  // Helper function to sanitize folder/file names for URL-safe usage
  const sanitizeName = (name: string): string => {
    return name
      .trim()
      .toLowerCase() // Convert to lowercase for consistency
      .replace(/[^a-z0-9\-_]/g, "-") // Replace invalid characters with dash
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Folder Name",
        description: "Please enter a folder name.",
      });
      return;
    }

    const sanitizedFolderName = sanitizeName(newFolderName);

    if (!sanitizedFolderName) {
      toast({
        variant: "destructive",
        title: "Invalid Folder Name",
        description:
          "Folder name contains only invalid characters. Please use letters, numbers, hyphens, or underscores.",
      });
      return;
    }

    // Show warning if name was changed
    if (sanitizedFolderName !== newFolderName.trim()) {
      toast({
        title: "Folder Name Sanitized",
        description: `Folder name changed to: "${sanitizedFolderName}" for URL compatibility.`,
      });
    }

    setIsCreatingFolder(true);
    // Normalize path separators and ensure consistent path handling
    const normalizedSelectedPath = normalizePath(selectedPath);
    const folderPath =
      normalizedSelectedPath === "docs"
        ? sanitizedFolderName
        : `${normalizedSelectedPath}/${sanitizedFolderName}`;

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create folder");
      }

      toast({
        title: "Success",
        description: `Folder "${newFolderName}" created successfully.`,
      });

      setShowNewFolderInput(false);
      setNewFolderName("");

      // Refresh tree while preserving expanded paths and expand parent folder
      await fetchFileTree(true);
      setExpandedPaths((prev) => new Set([...prev, selectedPath]));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Create Folder",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the folder.",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDelete = async (itemPath: string, isFolder: boolean) => {
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemPath,
          isFolder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete");
      }

      toast({
        title: "Success",
        description: `${isFolder ? "Folder" : "File"} deleted successfully.`,
      });

      // Refresh tree while preserving expanded paths
      await fetchFileTree(true);

      // If selected path was deleted, move to parent
      if (
        selectedPath === itemPath ||
        selectedPath.startsWith(itemPath + "/")
      ) {
        const parentPath = itemPath.includes("/")
          ? itemPath.substring(0, itemPath.lastIndexOf("/"))
          : "docs";
        setSelectedPath(parentPath);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Delete",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting.",
      });
    }
  };

  const handleRename = async (
    oldPath: string,
    newName: string,
    isFolder: boolean
  ) => {
    const sanitizedNewName = sanitizeName(newName);

    if (!sanitizedNewName) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description:
          "Name contains only invalid characters. Please use letters, numbers, hyphens, or underscores.",
      });
      return;
    }

    // Show warning if name was changed
    if (sanitizedNewName !== newName.trim()) {
      toast({
        title: "Name Sanitized",
        description: `Name changed to: "${sanitizedNewName}" for URL compatibility.`,
      });
    }

    try {
      const response = await fetch("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPath,
          newName: sanitizedNewName,
          isFolder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rename");
      }

      toast({
        title: "Success",
        description: `${isFolder ? "Folder" : "File"} renamed successfully.`,
      });

      // Refresh tree while preserving expanded paths
      await fetchFileTree(true);

      // Update selected path if renamed item was selected
      if (selectedPath === oldPath) {
        const parentPath = oldPath.includes("/")
          ? oldPath.substring(0, oldPath.lastIndexOf("/"))
          : "docs";
        const newPath =
          parentPath === "docs" ? newName : `${parentPath}/${newName}`;
        setSelectedPath(newPath);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Rename",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while renaming.",
      });
    }
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      toast({
        variant: "destructive",
        title: "Empty File Name",
        description: "Please enter a file name.",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Title",
        description: "Please enter a document title.",
      });
      return;
    }

    const sanitizedFileName = sanitizeName(
      fileName.trim().replace(/\.mdx$/, "")
    );

    if (!sanitizedFileName) {
      toast({
        variant: "destructive",
        title: "Invalid File Name",
        description:
          "File name contains only invalid characters. Please use letters, numbers, hyphens, or underscores.",
      });
      return;
    }

    // Show warning if name was changed
    if (sanitizedFileName !== fileName.trim().replace(/\.mdx$/, "")) {
      toast({
        title: "File Name Sanitized",
        description: `File name changed to: "${sanitizedFileName}" for URL compatibility.`,
      });
    }

    setIsSaving(true);
    const finalFileName = `${sanitizedFileName}.mdx`;
    const finalPath =
      selectedPath === "docs"
        ? finalFileName
        : path.join(selectedPath, finalFileName);

    try {
      await onSave(finalPath, {
        title: title.trim(),
        description: description.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by onSave
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Update Document" : "Save Document"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? `Editing: ${editMode.filePath}`
              : "Choose location and file name to save your document."}
          </DialogDescription>
        </DialogHeader>
        <DialogScrollableContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">File Name</Label>
              <div className="flex items-center">
                <Input
                  id="filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="new-document-name"
                  className="rounded-r-none"
                />
                <span className="flex h-10 items-center rounded-r-md border border-l-0 border-input bg-gray-100 px-3 text-sm text-muted-foreground">
                  .mdx
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Use letters, numbers, hyphens (-), and underscores (_) only.
                Spaces will be converted to hyphens.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Save Location</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
              </div>
              {showNewFolderInput && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="new-folder-name"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateFolder()
                      }
                    />
                    <Button
                      onClick={handleCreateFolder}
                      disabled={isCreatingFolder || !newFolderName.trim()}
                      size="sm"
                    >
                      {isCreatingFolder && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use letters, numbers, hyphens (-), and underscores (_) only.
                    Spaces will be converted to hyphens.
                  </p>
                </div>
              )}
              <ScrollArea className="h-48 rounded-md border">
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : items.docs ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={items.docs.children || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {/* Root drop zone indicator */}
                        {draggedItem && (
                          <div
                            className="relative mb-2"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDropIndicator({
                                nodeId: "docs",
                                position: "inside",
                              });
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // This will be handled by DnD Kit, but we set the indicator
                            }}
                          >
                            <div
                              className={cn(
                                "text-xs text-muted-foreground px-2 py-2 border border-dashed rounded transition-all",
                                dropIndicator?.nodeId === "docs" &&
                                  dropIndicator?.position === "inside"
                                  ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-400"
                                  : "bg-muted/50 border-muted-foreground/30 hover:border-blue-300 hover:bg-blue-50/50"
                              )}
                            >
                              📁 Drop here to move to root docs folder
                            </div>
                          </div>
                        )}

                        <TreeItem
                          nodeId="docs"
                          node={items.docs}
                          allNodes={items}
                          level={0}
                          selectedPath={selectedPath}
                          expandedPaths={expandedPaths}
                          onSelect={setSelectedPath}
                          onToggleExpand={handleToggleExpand}
                          onDelete={handleDelete}
                          onRename={handleRename}
                          draggedItem={draggedItem}
                          dropIndicator={dropIndicator}
                        />
                      </SortableContext>
                      <DragOverlay>
                        {draggedItem ? (
                          <DragOverlayItem nodeId={draggedItem} items={items} />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      No folder data available
                    </div>
                  )}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Path:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  content/docs/
                  {selectedPath === "docs" ? "" : `${selectedPath}/`}
                </code>
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Right-click to rename/delete • Drag handle (⋮⋮) to move
                files/folders
              </p>
              <p className="text-xs text-muted-foreground">
                🎯 Drag tips: Drop on folders to move inside • Drop between
                items to move to same level • Use root drop zone to move to docs
                folder
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ Names with spaces/special characters will be converted to
                URL-safe format (e.g., "My Folder" → "my-folder")
              </p>
            </div>
          </div>
        </DialogScrollableContent>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving || isLoading || !fileName.trim() || !title.trim()
            }
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
