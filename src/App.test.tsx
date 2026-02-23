import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import App from "@/App";

describe("App routing", () => {
  it("renders the 404 page for unknown routes", () => {
    window.history.pushState({}, "", "/does-not-exist");
    render(<App />);

    expect(
      screen.getByText(/this path leads to mystery/i)
    ).toBeInTheDocument();
  });
});
