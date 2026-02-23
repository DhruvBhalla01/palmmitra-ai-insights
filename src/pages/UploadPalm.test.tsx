import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { vi } from "vitest";
import UploadPalm from "@/pages/UploadPalm";
import { renderWithRouter } from "@/test/test-utils";
import { sampleReading } from "@/test/fixtures/palmReading";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => vi.fn());
const mockUpload = vi.hoisted(() => vi.fn());
const mockGetPublicUrl = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());

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

const createImageFile = () =>
  new File(["fake image"], "palm.png", { type: "image/png" });

describe("UploadPalm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("disables submission until the form is complete", () => {
    renderWithRouter(<UploadPalm />);
    expect(
      screen.getByRole("button", { name: /start palm scan/i })
    ).toBeDisabled();
  });

  it("shows a toast for invalid file types", () => {
    const { container } = renderWithRouter(<UploadPalm />);
    const input = container.querySelector(
      "input[type=\"file\"]"
    ) as HTMLInputElement;

    const invalidFile = new File(["bad"], "palm.txt", {
      type: "text/plain",
    });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Invalid file type",
      })
    );
  });

  it("uploads and navigates to the report on success", async () => {
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

    const { container } = renderWithRouter(<UploadPalm />);
    const input = container.querySelector(
      "input[type=\"file\"]"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createImageFile()] } });
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
      expect(mockUpload).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalledWith(
        "analyze-palm",
        expect.objectContaining({
          body: expect.objectContaining({
            email: "asha@example.com",
            name: "Asha",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/report/report-123");
    });

    const stored = JSON.parse(
      sessionStorage.getItem("palmMitraData") || "{}"
    );
    expect(stored.reportId).toBe("report-123");
    expect(stored.imageUrl).toBe("https://example.com/palm.png");
  });

  it("shows validation guidance when the image fails verification", async () => {
    mockUpload.mockResolvedValue({ data: { path: "uploads/palm.png" }, error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/palm.png" },
    });
    mockInvoke.mockResolvedValue({
      data: {
        validated: false,
        message: "Not a palm image",
        validation: { reason: "Not a palm" },
      },
      error: null,
    });

    const { container } = renderWithRouter(<UploadPalm />);
    const input = container.querySelector(
      "input[type=\"file\"]"
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createImageFile()] } });
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

    expect(
      await screen.findByText(/this does not look like a clear palm photo/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
