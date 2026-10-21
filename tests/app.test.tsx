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
it("starts the share flow from a resume and keeps Analyze disabled until text is added", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/share"]}>
      <App />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "Start from your resume." }),
  ).toBeInTheDocument();
  const analyze = screen.getByRole("button", { name: /Analyze with AI/ });
  expect(analyze).toBeDisabled();
  await user.click(
    screen.getByRole("button", { name: /fictional demo resume/ }),
  );
  expect(analyze).toBeEnabled();
  await user.click(screen.getByRole("tab", { name: "Paste text" }));
  expect(
    (
      screen.getByRole("textbox", {
        name: /Paste your resume/,
      }) as HTMLTextAreaElement
    ).value,
  ).toContain("Brightline Retail");
});
