const TEAM_ORDER_COLUMNS = [
  "player_name",
  "jersey_number",
  "size",
  "quantity",
  "product_type",
  "colorway",
  "notes",
] as const;

/** Generates a starter XLSX for roster-based team orders. */
export async function downloadTeamOrderKitSheet(defaultProductType = "jersey") {
  const XLSX = await import("xlsx");
  const rows = [
    Object.fromEntries(
      TEAM_ORDER_COLUMNS.map((key) => [key, key === "product_type" ? defaultProductType : ""]),
    ),
    {
      player_name: "Sample Player",
      jersey_number: "7",
      size: "M",
      quantity: 1,
      product_type: defaultProductType,
      colorway: "Green / Black",
      notes: "Captain set",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: TEAM_ORDER_COLUMNS as unknown as string[] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Team Order");
  XLSX.writeFile(workbook, "offgrid-team-order-kit.xlsx");
}
