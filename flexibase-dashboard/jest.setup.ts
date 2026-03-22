/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "",
}));

// Polyfill for ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Polyfill for PointerEvent
if (!window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, props: any) {
      super(type, props);
    }
  }
  (window as any).PointerEvent = PointerEvent;
}
