import { fireEvent, screen, waitFor, render } from "@testing-library/react";
import { vi } from "vitest";
import App from "@/App";
import { sampleReading } from "@/test/fixtures/palmReading";
import { HelmetProvider } from "react-helmet-async";

const mockUpload = vi.hoisted(() => vi.fn());
const mockGetPublicUrl = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());
const mockUnsubscribe = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
    functions: {
      invoke: mockInvoke,
    },
    // Table queries (e.g. approved testimonials on the report paywall) resolve empty.
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }),
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

vi.mock("@/hooks/useReportUnlock", () => ({
  useReportUnlock: () => ({
    isUnlocked: false,
    hasSubscription: false,
    isLoading: false,
    isProcessing: false,
    initiatePayment: vi.fn(),
  }),
}));

describe("Upload -> Report flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("creates a report and lands on the report page", { timeout: 20000 }, async () => {
    mockUpload.mockResolvedValue({ data: { path: "uploads/palm.png" }, error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/palm.png" },
    });
    mockInvoke.mockResolvedValue({
      data: {
        validated: true,
        reportId: "report-123",
        reading: sampleReading,
        validation: { confidence: 0.92, quality: "good" },
        generatedAt: "2026-02-12T00:00:00.000Z",
      },
      error: null,
    });

    window.history.pushState({}, "", "/upload");
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );

    const input = await waitFor(() => {
      const element = document.querySelector("input[type=\"file\"]");
      if (!element) throw new Error("Upload input has not mounted yet");
      return element as HTMLInputElement;
    });
    fireEvent.change(input, {
      target: {
        files: [new File(["x".repeat(25 * 1024)], "palm.png", { type: "image/png" })],
      },
    });

    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: "Asha" },
    });
    fireEvent.change(screen.getByLabelText(/your age/i), {
      target: { value: "28" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "asha@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /see my free destiny preview/i }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    });

    // The report route is lazy-loaded and navigation runs inside a React
    // transition, so allow extra time for the report page to mount.
    expect(
      await screen.findByText(/key destiny insight/i, undefined, { timeout: 8000 })
    ).toBeInTheDocument();
  });
});
