import { generateRoomId } from "../roomId";

describe("generateRoomId", () => {
  it("generates an id of the default length", () => {
    expect(generateRoomId()).toHaveLength(8);
  });

  it("generates an id of a custom length", () => {
    expect(generateRoomId(12)).toHaveLength(12);
  });

  it("only uses lowercase letters and digits", () => {
    const id = generateRoomId(50);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates different ids across calls", () => {
    const id1 = generateRoomId();
    const id2 = generateRoomId();
    expect(id1).not.toBe(id2);
  });
});