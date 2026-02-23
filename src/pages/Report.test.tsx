import { screen, waitFor } from "@testing-library/dom";
import { vi } from "vitest";
import Report from "@/pages/Report";
import { renderWithRouter } from "@/test/test-utils";
import { sampleReading } from "@/test/fixtures/palmReading";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockInitiatePayment = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

vi.mock("@/hooks/useReportUnlock", () => ({
  useReportUnlock: () => ({
    isUnlocked: false,
    hasSubscription: false,
    isLoading: false,
    isProcessing: false,
    initiatePayment: mockInitiatePayment,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("Report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders the report when session data is available", async () => {
    sessionStorage.setItem(
      "palmMitraData",
      JSON.stringify({
        name: "Asha",
        age: "28",
        email: "asha@example.com",
        readingType: "full",
        palmImage: "https://example.com/palm.png",
        imageUrl: "https://example.com/palm.png",
        reportId: "report-123",
        reading: sampleReading,
        generatedAt: "2026-02-12T00:00:00.000Z",
      })
    );

    renderWithRouter(<Report />, { route: "/report" });

    expect(
      await screen.findByText(/key destiny insight/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/reading for/i)).toBeInTheDocument();
    expect(screen.getAllByText(/unlock full report/i).length).toBeGreaterThan(0);
  });

  it("redirects to upload when no report data is found", async () => {
    renderWithRouter(<Report />, { route: "/report" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/upload");
    });
  });
});
