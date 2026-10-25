import { describe, it, expect } from "vitest";
import { formatElapsed } from "./formatElapsed";

describe("formatElapsed", () => {
  it("recién iniciada (0 segundos)", () => {
    const now = new Date("2026-10-25T00:00:00Z");
    const startedAt = "2026-10-25T00:00:00Z";
    const res = formatElapsed(now, startedAt);

    expect(res).toBe("0:00:00");
  });
  it("65 segundos", () => {
    const now = new Date("2026-10-25T00:01:05Z");
    const startedAt = "2026-10-25T00:00:00Z";
    const res = formatElapsed(now, startedAt);

    expect(res).toBe("0:01:05");
  });
  it("1 hora, 2 minutos y 3 segundos", () => {
    const now = new Date("2026-10-25T01:02:03Z");
    const startedAt = "2026-10-25T00:00:00Z";
    const res = formatElapsed(now, startedAt);

    expect(res).toBe("1:02:03");
  });
  it("más de 24 horas (25 horas)", () => {
    const now = new Date("2026-10-26T01:00:00Z");
    const startedAt = "2026-10-25T00:00:00Z";
    const res = formatElapsed(now, startedAt);

    expect(res).toBe("25:00:00");
  });
});
