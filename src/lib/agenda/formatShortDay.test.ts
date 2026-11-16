import { describe, it, expect } from "vitest";
import { formatShortDay } from "./formatShortDay";

describe("formatShortDay", () => {
  it("formatea un día de dos dígitos", () => {
    const date = "2026-11-15";
    const res = formatShortDay(date);

    expect(res).toBe("15 nov");
  });
  it("omite el cero inicial en un día de un dígito", () => {
    const date = "2026-11-02";
    const res = formatShortDay(date);

    expect(res).toBe("2 nov");
  });
  it("abrevia diciembre como dic", () => {
    const date = "2026-12-25";
    const res = formatShortDay(date);

    expect(res).toBe("25 dic");
  });
});
