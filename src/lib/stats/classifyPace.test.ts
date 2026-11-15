import { describe, it, expect } from "vitest";
import { classifyPace } from "./classifyPace";

describe("classifyPace", () => {
  it("clasifica faster cuando el ritmo es menor que el margen", () => {
    const pace = 0.94;
    const res = classifyPace(pace);

    expect(res).toBe("faster");
  });
  it("clasifica slower cuando el ritmo es mayor que el margen", () => {
    const pace = 1.06;
    const res = classifyPace(pace);

    expect(res).toBe("slower");
  });
  it("clasifica on-track cuando el ritmo es exacto", () => {
    const pace = 1;
    const res = classifyPace(pace);

    expect(res).toBe("on-track");
  });
  it("clasifica on-track en el borde inferior del margen 0.95", () => {
    const pace = 0.95;
    const res = classifyPace(pace);

    expect(res).toBe("on-track");
  });
  it("clasifica on-track en el borde superior del margen 1.05", () => {
    const pace = 1.05;
    const res = classifyPace(pace);

    expect(res).toBe("on-track");
  });
});
