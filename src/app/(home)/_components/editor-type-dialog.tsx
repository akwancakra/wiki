"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditorTypeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelect = (type: "live" | "code") => {
    setLoading(true);
    // Redirect to the appropriate editor route
    if (type === "live") {
      router.push("/editor/create?type=live");
    } else {
      router.push("/editor/create?type=code");
    }
    setTimeout(() => onOpenChange(false), 500); // Close dialog after navigation
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs w-full">
        <DialogHeader>
          <DialogTitle>Pilih Tipe Editor</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 px-6">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => handleSelect("live")}
            disabled={loading}
          >
            Live Preview Editor
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleSelect("code")}
            disabled={loading}
          >
            Code Editor (Split View)
          </Button>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Pilih mode editor yang diinginkan untuk membuat dokumen baru.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
