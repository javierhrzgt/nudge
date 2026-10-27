import { describe, it, expect } from "vitest";
import { formatDay } from "./formatDay";

describe("formatDay", () => {
  it("formats a regular weekday with a one-digit day", () => {
    const date = "2026-11-03";
    const res = formatDay(date);

    expect(res).toBe("martes 3 de noviembre");
  });
  it("formats a Sunday on the first day of the month", () => {
    const date = "2026-11-01";
    const res = formatDay(date);

    expect(res).toBe("domingo 1 de noviembre");
  });
  it("formats a Monday with a two-digit day", () => {
    const date = "2026-10-26";
    const res = formatDay(date);

    expect(res).toBe("lunes 26 de octubre");
  });
  it("formats a date in December", () => {
    const date = "2026-12-25";
    const res = formatDay(date);

    expect(res).toBe("viernes 25 de diciembre");
  });
  it("formats a date across the year boundary without showing the year", () => {
    const date = "2027-01-01";
    const res = formatDay(date);

    expect(res).toBe("viernes 1 de enero");
  });
});
