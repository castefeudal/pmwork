"use client";
import { useEffect, useRef } from "react";

/** Keep modal keyboard focus inside the surface and restore the invoking control. */
export function useDialogFocus() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const surface = ref.current;
    if (!surface) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const targets = () => Array.from(surface.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    (surface.querySelector<HTMLElement>('input:not([type="hidden"]), textarea') ?? targets()[0] ?? surface).focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = targets();
      const first = list[0], last = list[list.length - 1];
      if (!first || !last) { event.preventDefault(); surface.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !surface.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !surface.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
