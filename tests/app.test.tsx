import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import App from "../src/App";
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("renders the application and navigates to the searchable library", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: /Learn from the paths/ }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("link", {
      name: "Explore experiences",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Find a path that inspires yours." }),
    ).toBeInTheDocument(),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Search experiences" }),
    "northstar",
  );
  expect(
    screen.getByRole("heading", { name: "Business Analytics Intern" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Data Science Intern" }),
  ).not.toBeInTheDocument();
});
it("shows field validation before advancing the contribution form", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/share"]}>
      <App />
    </MemoryRouter>,
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getAllByText("Please enter at least 3 characters.").length,
  ).toBeGreaterThan(0);
  expect(
    screen.getByRole("heading", { name: "Let’s start with the basics." }),
  ).toBeInTheDocument();
});
