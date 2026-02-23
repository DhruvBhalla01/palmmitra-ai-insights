import { render } from "@testing-library/react";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { vi } from "vitest";
import { useReportUnlock } from "@/hooks/useReportUnlock";

const mockToast = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

function HookHarness({
  reportId,
  email,
}: {
  reportId?: string;
  email: string;
}) {
  const { isLoading, isUnlocked, hasSubscription, initiatePayment } =
    useReportUnlock(reportId, email);

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="unlocked">{String(isUnlocked)}</div>
      <div data-testid="subscription">{String(hasSubscription)}</div>
      <button onClick={() => initiatePayment("report99")}>Pay</button>
    </div>
  );
}

describe("useReportUnlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips unlock check when email is missing", async () => {
    render(<HookHarness email="" />);

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("sets unlock state from the backend response", async () => {
    mockInvoke.mockResolvedValue({
      data: {
        success: true,
        isUnlocked: true,
        hasSubscription: true,
      },
      error: null,
    });

    render(<HookHarness email="asha@example.com" reportId="report-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("unlocked").textContent).toBe("true");
      expect(screen.getByTestId("subscription").textContent).toBe("true");
    });
  });

  it("blocks payment when email is missing", async () => {
    render(<HookHarness email="" />);

    fireEvent.click(screen.getByRole("button", { name: /pay/i }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Email Required" })
    );
  });
});
