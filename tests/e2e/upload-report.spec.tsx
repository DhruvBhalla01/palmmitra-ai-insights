import { fireEvent, screen, waitFor, render } from "@testing-library/react";
import { vi } from "vitest";
import App from "@/App";
import { sampleReading } from "@/test/fixtures/palmReading";

const mockUpload = vi.hoisted(() => vi.fn());
const mockGetPublicUrl = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

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

  it("creates a report and lands on the report page", async () => {
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
    render(<App />);

    const input = document.querySelector(
      "input[type=\"file\"]"
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [new File(["fake image"], "palm.png", { type: "image/png" })],
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

    fireEvent.click(screen.getByRole("button", { name: /start palm scan/i }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(/key destiny insight/i)
    ).toBeInTheDocument();
  });
});
