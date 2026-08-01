import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression: anon retail checkout must not hit false "Invalid or inactive product"
 * when og_products RLS allows SELECT but not FOR UPDATE/UPDATE.
 * The validate trigger must run as SECURITY DEFINER.
 */
describe("og_validate_retail_order_insert security", () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260801120000_retail_validate_security_definer.sql",
    ),
    "utf8",
  );

  it("marks the retail validate function SECURITY DEFINER", () => {
    expect(migration).toMatch(
      /CREATE OR REPLACE FUNCTION public\.og_validate_retail_order_insert\(\)[\s\S]*?SECURITY DEFINER/,
    );
  });

  it("revokes direct client EXECUTE so it is trigger-only", () => {
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.og_validate_retail_order_insert\(\) FROM PUBLIC, anon, authenticated/,
    );
  });
});

describe("og_apply_live_retail_prices security", () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260801121000_apply_live_prices_security_definer.sql",
    ),
    "utf8",
  );

  it("marks apply-live prices SECURITY DEFINER (sibling of validate FOR UPDATE bug)", () => {
    expect(migration).toMatch(
      /CREATE OR REPLACE FUNCTION public\.og_apply_live_retail_prices\(\)[\s\S]*?SECURITY DEFINER/,
    );
  });

  it("aligns max line quantity with retail validate (100)", () => {
    expect(migration).toMatch(/quantity_value > 100/);
  });
});

describe("og_restore_retail_stock_on_cancel security", () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260801122000_restore_retail_stock_on_cancel.sql",
    ),
    "utf8",
  );

  it("restores stock as SECURITY DEFINER (avoids product write RLS on cancel)", () => {
    expect(migration).toMatch(
      /CREATE OR REPLACE FUNCTION public\.og_restore_retail_stock_on_cancel\(\)[\s\S]*?SECURITY DEFINER/,
    );
  });

  it("only restores tracked stock (null stock stays unlimited)", () => {
    expect(migration).toMatch(/stock IS NOT NULL/);
    expect(migration).toMatch(/SET stock = stock \+ qty/);
  });
});

describe("og_restrict_customer_order_column_updates owner bypass", () => {
  const migration = readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260801123000_restrict_order_updates_db_owner_bypass.sql",
    ),
    "utf8",
  );

  it("allows postgres/supabase_admin and bypassrls roles when JWT is empty", () => {
    expect(migration).toMatch(/current_user IN \('postgres', 'supabase_admin'\)/);
    expect(migration).toMatch(/rolbypassrls/);
  });
});
