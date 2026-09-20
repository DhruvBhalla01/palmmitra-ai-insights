import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import App from "@/App";
import { HelmetProvider } from "react-helmet-async";

describe("App routing", () => {
  it("renders the 404 page for unknown routes", async () => {
    window.history.pushState({}, "", "/does-not-exist");
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );

    expect(
      await screen.findByText(/this path leads to mystery/i)
    ).toBeInTheDocument();
  });
});
