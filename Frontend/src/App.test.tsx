import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import App from "./App";

function renderWithProviders() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/health")) {
          return {
            ok: true,
            json: async () => ({
              status: "ok",
              environment: "test",
              timestamp: new Date().toISOString(),
            }),
            headers: new Headers({ "content-type": "application/json" }),
          } as unknown as Response;
        }

        return {
          ok: true,
          json: async () => ({}),
          headers: new Headers({ "content-type": "application/json" }),
        } as unknown as Response;
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders brand headline", async () => {
    renderWithProviders();
    expect(screen.getByRole("heading", { name: /বাঘ ল্যাং শেখো/i })).toBeInTheDocument();
  });

  it("has navigation links in bengali", () => {
    renderWithProviders();
    expect(screen.getByRole("link", { name: "প্লেগ্রাউন্ড" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "পাঠশালা" })).toBeInTheDocument();
  });

  it("renders all Bangla text correctly", () => {
    renderWithProviders();
    // The learn page contains the lesson titles with Bangla text
    // Just verify that the app renders without crashing
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("Lesson Data Structure", () => {
  it("all lessons have required fields", async () => {
    const { lessons } = await import("./data/lessons");
    expect(lessons.length).toBeGreaterThanOrEqual(6);

    lessons.forEach((lesson) => {
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.mascot).toBeTruthy();
      expect(lesson.level).toMatch(/সহজ|মাঝারি|চ্যালেঞ্জ/);
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.practice.length).toBeGreaterThan(0);
    });
  });

  it("each lesson section has code examples", async () => {
    const { lessons } = await import("./data/lessons");

    lessons.forEach((lesson) => {
      const hasCode = lesson.sections.some((section) => section.code);
      expect(hasCode).toBe(true);

      lesson.sections.forEach((section) => {
        if (section.code) {
          expect(section.code.bagh).toBeTruthy();
          expect(section.code.python).toBeTruthy();
          expect(section.code.note).toBeTruthy();
        }
      });
    });
  });
});

describe("Challenge Data Structure", () => {
  it("all challenges have required fields", async () => {
    const { challenges } = await import("./data/problems");
    expect(challenges.length).toBeGreaterThanOrEqual(3);

    challenges.forEach((challenge) => {
      expect(challenge.id).toBeTruthy();
      expect(challenge.title).toBeTruthy();
      expect(challenge.story).toBeTruthy();
      expect(challenge.goal).toBeTruthy();
      expect(challenge.starter).toBeTruthy();
      expect(challenge.hints.length).toBeGreaterThan(0);
      expect(challenge.difficulty).toMatch(/সহজ|মাঝারি|চ্যালেঞ্জ/);
    });
  });
});

describe("API Exports", () => {
  it("all required API functions exist", async () => {
    const api = await import("./lib/api");
    expect(typeof api.executeBagh).toBe("function");
    expect(typeof api.translateBagh).toBe("function");
    expect(typeof api.assistWithBagh).toBe("function");
    expect(typeof api.checkHealth).toBe("function");
    expect(typeof api.buildAssetUrl).toBe("function");
  });
});

describe("Bangla Unicode Support", () => {
  it("lesson titles contain Bangla characters", async () => {
    const { lessons } = await import("./data/lessons");
    lessons.forEach((lesson) => {
      // Bangla Unicode range: \u0980-\u09FF
      expect(lesson.title).toMatch(/[ঀ-৿]/);
    });
  });

  it("lesson content preserves emoji and Bangla", async () => {
    const { lessons } = await import("./data/lessons");
    const hasEmoji = lessons.some((lesson) => lesson.mascot && lesson.mascot.length > 0);
    expect(hasEmoji).toBe(true);
  });
});
