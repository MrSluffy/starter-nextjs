import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeneratorStore } from "@/store/generatorStore";
import { StepSummary } from "./StepSummary";

describe("StepSummary", () => {
  beforeEach(() => {
    useGeneratorStore.getState().reset();
  });

  it("downloads a generated zip from the API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["zip-bytes"]),
    });
    const anchor = document.createElement("a");
    const originalCreateElement = document.createElement.bind(document);
    const clickSpy = vi.spyOn(anchor, "click").mockImplementation(() => {});
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "a") return anchor;
        return originalCreateElement(tagName);
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<StepSummary />);

    await user.click(screen.getByRole("button", { name: /download my-next-app\.zip/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/generate", expect.any(Object));
    });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(anchor.download).toBe("my-next-app.zip");

    createElementSpy.mockRestore();
  });

  it("shows an API error message when generation fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Broken config" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<StepSummary />);

    await user.click(screen.getByRole("button", { name: /download my-next-app\.zip/i }));

    expect(await screen.findByText(/broken config/i)).toBeInTheDocument();
  });
});
