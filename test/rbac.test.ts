import { describe, expect, it } from "vitest";
import {
  assertCan,
  can,
  ForbiddenError,
  isAtLeast,
  outranks,
} from "@/lib/rbac";

describe("rbac.can", () => {
  it("owner can do everything sensitive", () => {
    expect(can("OWNER", "org:delete")).toBe(true);
    expect(can("OWNER", "billing:manage")).toBe(true);
    expect(can("OWNER", "members:change_role")).toBe(true);
  });

  it("admin can manage members but not delete the org or manage billing", () => {
    expect(can("ADMIN", "members:invite")).toBe(true);
    expect(can("ADMIN", "org:delete")).toBe(false);
    expect(can("ADMIN", "billing:manage")).toBe(false);
  });

  it("member has read-mostly access", () => {
    expect(can("MEMBER", "projects:create")).toBe(true);
    expect(can("MEMBER", "projects:delete")).toBe(false);
    expect(can("MEMBER", "members:invite")).toBe(false);
  });
});

describe("rbac.assertCan", () => {
  it("throws ForbiddenError when not allowed", () => {
    expect(() => assertCan("MEMBER", "billing:manage")).toThrow(ForbiddenError);
  });
  it("does not throw when allowed", () => {
    expect(() => assertCan("OWNER", "billing:manage")).not.toThrow();
  });
});

describe("rbac hierarchy", () => {
  it("outranks compares roles", () => {
    expect(outranks("OWNER", "ADMIN")).toBe(true);
    expect(outranks("ADMIN", "MEMBER")).toBe(true);
    expect(outranks("MEMBER", "ADMIN")).toBe(false);
    expect(outranks("ADMIN", "ADMIN")).toBe(false);
  });

  it("isAtLeast enforces minimum role", () => {
    expect(isAtLeast("OWNER", "ADMIN")).toBe(true);
    expect(isAtLeast("ADMIN", "ADMIN")).toBe(true);
    expect(isAtLeast("MEMBER", "ADMIN")).toBe(false);
  });
});
