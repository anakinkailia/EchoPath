import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CompanyMark } from "../src/company-mark";

afterEach(cleanup);

it("falls back to an industry icon if a firm logo cannot load", () => {
  const { container } = render(
    <CompanyMark
      e={{ company: "Google", industry: "Technology", provenance: "published" }}
    />,
  );
  const image = container.querySelector("img")!;
  expect(image.getAttribute("src")).toBe("/company-logos/google.png");
  fireEvent.error(image);
  expect(container.querySelector("img")).toBeNull();
  expect(
    container.querySelector('[data-industry="technology"] svg'),
  ).not.toBeNull();
});

it("does not give fictional records a real firm's identity", () => {
  const { container } = render(
    <CompanyMark
      e={{ company: "Google", industry: "Technology", provenance: "fictional" }}
    />,
  );
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector("svg")).not.toBeNull();
});

it("uses the same industry symbol for unknown firms in that industry", () => {
  const { container } = render(
    <>
      <CompanyMark e={{ company: "Northstar Labs", industry: "Technology" }} />
      <CompanyMark e={{ company: "Orbit Workspace", industry: "Technology" }} />
    </>,
  );
  const icons = container.querySelectorAll("svg");
  expect(icons[0].innerHTML).toBe(icons[1].innerHTML);
});

it("handles unknown industries and company names that match object properties", () => {
  const { container } = render(
    <CompanyMark e={{ company: "constructor", industry: "New field" }} />,
  );
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector('[data-industry="other"] svg')).not.toBeNull();
});
