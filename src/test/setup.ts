import "@testing-library/jest-dom";
import React from "react";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("framer-motion", () => {
  const MotionProxy = new Proxy(
    {},
    {
      get: (_target, prop) =>
        React.forwardRef(({ children, ...rest }: Record<string, unknown>, ref) => {
          const cleaned = { ...rest } as Record<string, unknown>;
          [
            "initial",
            "animate",
            "exit",
            "transition",
            "whileHover",
            "whileTap",
            "whileInView",
            "viewport",
            "layout",
            "layoutId",
            "drag",
            "dragConstraints",
            "variants",
          ].forEach((key) => {
            delete cleaned[key];
          });

          return React.createElement(prop as string, { ref, ...cleaned }, children);
        }),
    }
  );

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: MotionProxy,
  };
});

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  value: vi.fn(),
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(_file: File) {
    this.result = "data:image/png;base64,FAKE_IMAGE";
    this.onload?.({ target: this } as ProgressEvent<FileReader>);
  }
}

Object.defineProperty(window, "FileReader", {
  writable: true,
  value: MockFileReader,
});

if (!navigator.clipboard) {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
}

if (!navigator.share) {
  Object.assign(navigator, {
    share: vi.fn().mockResolvedValue(undefined),
  });
}
