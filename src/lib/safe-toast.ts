// Schedule Sonner toast calls outside the current render tick to avoid
// "Cannot update a component while rendering a different component" in React 19.
// eslint-disable-next-line no-restricted-imports
import { toast as baseToast } from "sonner";

// Use a microtask; falls back to immediate in SSR
function schedule(fn: () => void) {
  if (typeof window === "undefined") {
    fn();
    return;
  }
  Promise.resolve().then(fn);
}

type Options = Parameters<typeof baseToast.success>[1];

export const toast = Object.assign(
  (message: string, opts?: Options) => schedule(() => baseToast(message, opts)),
  {
    success: (title: string, opts?: Options) =>
      schedule(() => baseToast.success(title, opts)),
    error: (title: string, opts?: Options) =>
      schedule(() => baseToast.error(title, opts)),
    info: (title: string, opts?: Options) =>
      schedule(() => baseToast.info(title, opts)),
    warning: (title: string, opts?: Options) =>
      schedule(() => baseToast.warning(title, opts)),
    promise: baseToast.promise, // keep as-is; it manages its own lifecycle
    dismiss: (id?: string | number) => schedule(() => baseToast.dismiss(id)),
  }
);
export default toast;
