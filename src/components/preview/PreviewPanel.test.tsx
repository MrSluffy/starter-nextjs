import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeneratorStore } from "@/store/generatorStore";
import { PreviewPanel } from "./PreviewPanel";

describe("PreviewPanel", () => {
  beforeEach(() => {
    useGeneratorStore.getState().reset();
  });

  it("renders structure, dependencies, and CLI previews from store state", async () => {
    useGeneratorStore.setState({
      projectName: "preview-app",
      packageManager: "pnpm",
      styling: "sass",
      stateManagement: "redux-toolkit",
      apiLayer: "graphql",
      database: "postgresql",
      orm: "prisma",
      extras: {
        docker: true,
        githubActions: true,
        openApiClient: true,
        eslintPrettier: true,
        huskyLintStaged: false,
      },
    });

    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

    render(<PreviewPanel />);

    expect(screen.getByText("preview-app")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /deps/i }));
    expect(screen.getByText("graphql")).toBeInTheDocument();
    expect(screen.queryByText("drizzle-orm")).not.toBeInTheDocument();
    expect(screen.getByText("@prisma/client")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "CLI" }));
    expect(screen.getByText(/pnpm create next-app/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
