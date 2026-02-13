import { fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ActionButtons } from "@/components/report/ActionButtons";
import { renderWithRouter } from "@/test/test-utils";
import { sampleReading } from "@/test/fixtures/palmReading";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => vi.fn());
const mockGeneratePDF = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/lib/generateReportPDF", () => ({
  generateReportPDF: mockGeneratePDF,
}));

describe("ActionButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prompts unlock when the report is locked", () => {
    const onUnlockClick = vi.fn();

    renderWithRouter(
      <ActionButtons
        isUnlocked={false}
        onUnlockClick={onUnlockClick}
        reading={sampleReading}
        userData={{
          name: "Asha",
          readingType: "full",
          generatedAt: "2026-02-12T00:00:00.000Z",
        }}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /unlock to download pdf/i })
    );

    expect(onUnlockClick).toHaveBeenCalled();
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });

  it("generates the PDF when unlocked", async () => {
    renderWithRouter(
      <ActionButtons
        isUnlocked={true}
        reading={sampleReading}
        userData={{
          name: "Asha",
          readingType: "full",
          generatedAt: "2026-02-12T00:00:00.000Z",
        }}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /download full pdf report/i })
    );

    await waitFor(() => {
      expect(mockGeneratePDF).toHaveBeenCalledWith(
        sampleReading,
        expect.objectContaining({ name: "Asha" })
      );
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/pdf downloaded/i) })
    );
  });
});
