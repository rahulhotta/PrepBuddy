import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useProgress } from "../features/progress/store";
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
    useProgress.getState().reset();
    consoleError = vi.spyOn(console, "error");
  });
  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("home lists topic sheets with progress and the sources footer", async () => {
    renderAt("/");
    const sheet = await screen.findByRole("link", { name: /SHEET 01/ });
    expect(sheet).toHaveAttribute("href", "/low-level-design");
    expect(within(sheet).getByText(/items covered/)).toBeInTheDocument();
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

  it("marks a Q&A understood", async () => {
    const user = userEvent.setup();
    renderAt("/low-level-design/observer/qa");
    await user.click(await screen.findByText("What is the Observer pattern?"));
    const [button] = screen.getAllByRole("button", { name: "MARK UNDERSTOOD" });
    await user.click(button);
    expect(useProgress.getState().qa.observer).toEqual({ "observer-qa-01": true });
  });

  it("toggles case-study steps as covered", async () => {
    const user = userEvent.setup();
    renderAt("/low-level-design/parking-lot/case-study");
    const step = await screen.findByRole("button", { name: /Clarify the rules/ });
    await user.click(step);
    expect(step).toHaveAttribute("aria-pressed", "true");
    expect(useProgress.getState().steps["parking-lot"]).toEqual({ "0": true });
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
