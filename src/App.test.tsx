import { render, screen, waitFor } from "@testing-library/react";
import App from "@/App";

describe("App routing", () => {
  it("renders the 404 page for unknown routes", async () => {
    window.history.pushState({}, "", "/does-not-exist");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/this path leads to mystery/i)).toBeInTheDocument();
    });
  });
});
