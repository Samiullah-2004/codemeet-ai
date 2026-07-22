import { isValidRoomId } from "../validateRoomId";

describe("isValidRoomId", () => {
  it("accepts a valid lowercase alphanumeric code", () => {
    expect(isValidRoomId("x7k2p9aa")).toBe(true);
  });

  it("rejects codes that are too short", () => {
    expect(isValidRoomId("abc")).toBe(false);
  });

  it("rejects codes that are too long", () => {
    expect(isValidRoomId("a".repeat(25))).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(isValidRoomId("ABC123")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(isValidRoomId("abc-123")).toBe(false);
  });

  it("trims whitespace before validating", () => {
    expect(isValidRoomId("  x7k2p9aa  ")).toBe(true);
  });
});