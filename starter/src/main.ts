import "./styles.css";

/** The one thing this project does. Replace it. */
export function greet(name: string): string {
  return `${name} is running.`;
}

export function mount(root: HTMLElement): void {
  const p = document.createElement("p");
  p.className = "placeholder";
  p.textContent = greet("{{NAME}}");
  root.replaceChildren(p);
}

const root = document.getElementById("app");
if (root) mount(root);
