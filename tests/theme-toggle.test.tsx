import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemeToggle } from "../src/theme-toggle";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
});

it("switches both ways and restores the saved choice on remount", async () => {
  const user = userEvent.setup();
  const view = render(<ThemeToggle />);
  await user.click(
    screen.getByRole("button", { name: "Switch to light theme" }),
  );
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem("echopath:theme")).toBe("light");
  view.unmount();
  render(<ThemeToggle />);
  await user.click(
    screen.getByRole("button", { name: "Switch to dark theme" }),
  );
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("echopath:theme")).toBe("dark");
});

it("continues switching when browser storage is blocked", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  const user = userEvent.setup();
  render(<ThemeToggle />);
  await user.click(
    screen.getByRole("button", { name: "Switch to light theme" }),
  );
  expect(document.documentElement.dataset.theme).toBe("light");
});
