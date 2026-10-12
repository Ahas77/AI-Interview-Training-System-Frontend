import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export function LoadingSkeleton({ label = "Loading analytics..." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0E8C86]" />
      <p className="mt-3 text-sm font-semibold text-[#0B3538]">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-red-800">Unable to load this view</p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
      <p className="text-base font-bold text-[#0B3538]">{title}</p>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">{message}</p>
    </div>
  );
}
