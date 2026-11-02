import { describe, it, expect } from "vitest";
import { buildStartedAt } from "./buildStartedAt";

describe("buildStartedAt", () => {
  it("una hora con zona horaria en Guatemala (America/Guatemala)", () => {
    const date = "2026-11-01";
    const time = "08:30";
    const timezone = "America/Guatemala";
    const res = buildStartedAt({ date, time, timezone });

    expect(res).toEqual(new Date("2026-11-01T14:30:00Z"));
  });
  it("las 08:30 en Tokio son otro instante que las 08:30 en Guatemala", () => {
    const date = "2026-11-01";
    const time = "08:30";
    const timezone = "Asia/Tokyo";
    const res = buildStartedAt({ date, time, timezone });

    expect(res).toEqual(new Date("2026-10-31T23:30:00Z"));
  });
  it("fecha no ingresada", () => {
    const date = null;
    const time = "08:30";
    const timezone = "America/Guatemala";
    const res = buildStartedAt({ date, time, timezone });

    expect(res).toBeNull();
  });
  it("hora no ingresada", () => {
    const date = "2026-11-01";
    const time = null;
    const timezone = "America/Guatemala";
    const res = buildStartedAt({ date, time, timezone });

    expect(res).toBeNull();
  });
  it("faltan fecha y hora", () => {
    const date = null;
    const time = null;
    const timezone = "America/Guatemala";
    const res = buildStartedAt({ date, time, timezone });

    expect(res).toBeNull();
  });
});
