import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "./AppRoutes";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe("routes", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeAll(async () => {
    // Warm the lazy chunks so findBy* timing does not depend on first-time transforms.
    await Promise.all([import("./HomePage"), import("./TopicPage"), import("./SubjectPage"), import("./NotFoundPage")]);
  }, 60_000);
  beforeEach(() => {
    consoleError = vi.spyOn(console, "error");
  });
  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("home lists topic sheets without progress and retains the sources footer", async () => {
    renderAt("/");
    const sheet = await screen.findByRole("link", { name: /SHEET 01/ });
    expect(sheet).toHaveAttribute("href", "/low-level-design");
    expect(screen.getByRole("link", { name: "PREPBUDDY" })).toHaveAttribute("href", "/");
    expect(within(sheet).queryByText(/items covered/)).not.toBeInTheDocument();
    expect(screen.getByText(/Syllabus inspired by Awesome Low Level Design\./)).toBeInTheDocument();
    expect(await screen.findByText("NOTE 1, QUESTION OF THE DAY")).toBeInTheDocument();
  });

  it("topic page lists subjects as links", async () => {
    renderAt("/low-level-design");
    expect(await screen.findByRole("heading", { level: 1, name: "Low Level Design" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Observer/ })).toHaveAttribute("href", "/low-level-design/observer");
    const behavioral = screen.getByRole("region", { name: /Behavioral Design Patterns/ });
    expect(within(behavioral).getByRole("link", { name: /Strategy/ })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Clean Code/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "START MOCK INTERVIEW" })).toBeInTheDocument();
    expect(screen.queryByText(/items covered/)).not.toBeInTheDocument();
  });

  it("subject URL without a material redirects to the first tab", async () => {
    renderAt("/low-level-design/observer");
    const tab = await screen.findByRole("link", { name: "Q&A" });
    expect(tab).toHaveAttribute("aria-current", "page");
    expect(await screen.findByText("What is the Observer pattern?")).toBeInTheDocument();
  });

  it("shows only the tabs a subject has and a breadcrumb", async () => {
    renderAt("/low-level-design/parking-lot/case-study");
    const tabs = within(await screen.findByRole("navigation", { name: "Materials" }));
    expect(tabs.getAllByRole("link").map((l) => l.textContent)).toEqual(["Case study", "Diagram"]);
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByRole("link", { name: "INDEX" })).toBeInTheDocument();
    expect(crumbs.getByText("DESIGN A PARKING LOT")).toHaveAttribute("aria-current", "page");
  });

  it("reveals Q&A answers without tracking understanding", async () => {
    const user = userEvent.setup();
    renderAt("/low-level-design/observer/qa");
    await user.click(await screen.findByText("What is the Observer pattern?"));
    expect(screen.getByText("What is the Observer pattern?").closest("details")).toHaveAttribute("open");
    expect(screen.queryByRole("button", { name: /UNDERSTOOD/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/QUESTIONS, .* UNDERSTOOD/)).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it("renders case-study steps as a read-only ordered list", async () => {
    renderAt("/low-level-design/parking-lot/case-study");
    const step = await screen.findByText("Clarify the rules");
    expect(step.closest("ol")).toHaveClass("steps");
    expect(step.closest("li")).not.toHaveAttribute("aria-pressed");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/SELECT A STEP/)).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it("renders the diagram", async () => {
    renderAt("/low-level-design/observer/diagram");
    expect(await screen.findByRole("img", { name: "Observer class diagram" })).toBeInTheDocument();
  });

  it("renders notes and the highlighted Python example", async () => {
    renderAt("/low-level-design/observer/explanation");
    expect(await screen.findByRole("heading", { name: "Pythonic note" }, { timeout: 20_000 })).toBeInTheDocument();
    expect(await screen.findByText("python-examples/observer/example.py", {}, { timeout: 20_000 })).toBeInTheDocument();
  }, 30_000);

  it("unknown routes show the not-found sheet", async () => {
    renderAt("/low-level-design/nope");
    expect(await screen.findByRole("heading", { name: "Sheet not found" })).toBeInTheDocument();
  });
});
