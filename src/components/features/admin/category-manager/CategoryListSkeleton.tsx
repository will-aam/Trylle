import { Skeleton } from "@/src/components/ui/skeleton";

export function CategoryListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border rounded-md px-4 py-3 bg-muted/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}
