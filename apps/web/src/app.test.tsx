import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./app";

describe("App", () => {
  it("renders the field sheet and live preview", () => {
    render(<App />);

    expect(screen.getByText("Field sheet")).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: "Live form preview" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Customer intake")).toBeInTheDocument();
  });

  it("updates preview labels when a field label changes", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("customer_name label"), {
      target: { value: "Legal name" },
    });

    await waitFor(() => {
      expect(
        screen.getAllByText(
          (_, element) => element?.textContent === "Legal name *",
        ).length,
      ).toBeGreaterThan(0);
    });
  });
});
