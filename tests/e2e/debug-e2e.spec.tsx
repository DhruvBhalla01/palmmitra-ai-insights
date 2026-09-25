import { fireEvent, screen, waitFor, render } from "@testing-library/react";
import { vi } from "vitest";
import App from "@/App";
import { sampleReading } from "@/test/fixtures/palmReading";
import { HelmetProvider } from "react-helmet-async";

const mockUpload = vi.hoisted(() => vi.fn());
const mockGetPublicUrl = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: { from: () => ({ upload: mockUpload, getPublicUrl: mockGetPublicUrl }) },
    functions: { invoke: mockInvoke },
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

vi.mock("@/hooks/useReportUnlock", () => ({
  useReportUnlock: () => ({ isUnlocked: false, hasSubscription: false, isLoading: false, isProcessing: false, initiatePayment: vi.fn() }),
}));

it("debug navigation", async () => {
  mockUpload.mockResolvedValue({ data: { path: "uploads/palm.png" }, error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://example.com/palm.png" } });
  mockInvoke.mockResolvedValue({
    data: { validated: true, reportId: "report-123", reading: sampleReading, validation: { confidence: 0.92, quality: "good" }, generatedAt: "2026-02-12T00:00:00.000Z" },
    error: null,
  });
  window.history.pushState({}, "", "/upload");
  render(<HelmetProvider><App /></HelmetProvider>);
  const input = await waitFor(() => document.querySelector('input[type="file"]') as HTMLInputElement);
  fireEvent.change(input, { target: { files: [new File(["x".repeat(25 * 1024)], "palm.png", { type: "image/png" })] } });
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Asha" } });
  fireEvent.change(screen.getByLabelText(/your age/i), { target: { value: "28" } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "asha@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: /see my free destiny preview/i }));
  await waitFor(() => expect(mockInvoke).toHaveBeenCalled());
  await new Promise(r => setTimeout(r, 1500));
  console.log("PATH:", window.location.pathname);
  console.log("SESSION:", sessionStorage.getItem("palmMitraData")?.slice(0, 120));
  console.log("H1s:", [...document.querySelectorAll("h1")].map(h => h.textContent));
  console.log("BODY TEXT SAMPLE:", document.body.textContent?.slice(0, 400));
}, 20000);
