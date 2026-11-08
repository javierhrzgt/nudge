import { describe, it, expect } from "vitest";
import { calculatePercentage } from "./calculatePercentage";

describe("calculatePercentage", () => {
  it("sin metas en total devuelve 0", () => {
    const completed = 0;
    const total = 0;
    const res = calculatePercentage({ completed, total });
    expect(res).toBe(0);
  });
  it("con ninguna completada devuelve 0", () => {
    const completed = 0;
    const total = 10;
    const res = calculatePercentage({ completed, total });
    expect(res).toBe(0);
  });
  it("con la mitad completada devuelve 50", () => {
    const completed = 5;
    const total = 10;
    const res = calculatePercentage({ completed, total });
    expect(res).toBe(50);
  });
  it("con todas completadas devuelve 100", () => {
    const completed = 5;
    const total = 5;
    const res = calculatePercentage({ completed, total });
    expect(res).toBe(100);
  });
  it("un resultado no exacto conserva los decimales", () => {
    const completed = 1;
    const total = 3;
    const res = calculatePercentage({ completed, total });
    expect(res).toBeCloseTo(33.33, 2);
  });
});
