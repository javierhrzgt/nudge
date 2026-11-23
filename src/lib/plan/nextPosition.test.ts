import { describe, it, expect } from "vitest";
import { nextPosition } from "./nextPosition";

describe("nextPosition", () => {
  it("lista vacía devuelve 1", () => {
    const res = nextPosition([]);

    expect(res).toBe(1);
  });
  it("una posición devuelve el mayor +1", () => {
    const res = nextPosition([1]);

    expect(res).toBe(2);
  });
  it("una con datos desordenados devuelve el mayor +1", () => {
    const res = nextPosition([2, 7, 4]);

    expect(res).toBe(8);
  });
});
