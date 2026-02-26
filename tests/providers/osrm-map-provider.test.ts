import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OsrmMapProvider } from "@/providers/map/osrm-map-provider";
import { BadRequestError, ExternalServiceError } from "@/errors";

vi.mock("@/config", () => ({
  config: {
    osrmBaseUrl: "http://mock-osrm/route/v1/driving",
  },
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    info: vi.fn(),
  },
}));

function makeFetchResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("OsrmMapProvider.getDistanceKm", () => {
  let provider: OsrmMapProvider;
  let fetchSpy: any;

  beforeEach(() => {
    provider = new OsrmMapProvider();
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw BadRequestError if city is not registered", async () => {
    await expect(
      provider.getDistanceKm("CidadeInvalida", "Rio de Janeiro"),
    ).rejects.toThrow(BadRequestError);
  });

  it("should throw ExternalServiceError if fetch response is not ok", async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse({}, 500));

    await expect(
      provider.getDistanceKm("Sao Paulo", "Rio de Janeiro"),
    ).rejects.toThrow(ExternalServiceError);
  });

  it("should throw ExternalServiceError if OSRM code is not Ok", async () => {
    fetchSpy.mockResolvedValue(
      makeFetchResponse({ code: "NoRoute", routes: [] }),
    );

    await expect(
      provider.getDistanceKm("Sao Paulo", "Rio de Janeiro"),
    ).rejects.toThrow(ExternalServiceError);
  });

  it("should return the correct distance", async () => {
    fetchSpy.mockResolvedValue(
      makeFetchResponse({
        code: "Ok",
        routes: [{ distance: 450000, duration: 18000 }],
      }),
    );

    const result = await provider.getDistanceKm("Sao Paulo", "Rio de Janeiro");

    expect(result).toBe(450);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
