import { useEffect, useRef, ReactNode, use } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  // TODO: implement
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElement = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      '[tabIndex]:not([tabIndex="-1"])',
    ];
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const focusableEls = dialogNode.querySelectorAll<HTMLElement>(
      focusableElement.join(","),
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    firstEl.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        if (focusableEls.length === 0) {
          e.preventDefault();

          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", () => {});
    };
  }, [isOpen, onClose]);
  return null;
}
