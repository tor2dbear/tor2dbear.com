import { describe, expect, it } from "vitest";
import { greet, mount } from "./main";

describe("{{NAME}}", () => {
  it("greets", () => {
    expect(greet("It")).toBe("It is running.");
  });

  it("mounts into a root element", () => {
    const root = document.createElement("div");
    mount(root);
    expect(root.querySelector(".placeholder")?.textContent).toContain("running");
  });
});
