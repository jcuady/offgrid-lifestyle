/** 1-based page window with ellipsis — shared by portal admin lists. */
export function buildPageNumbers(current: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 1) return totalPages === 1 ? [1] : [];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function clampPage(page: number, pageCount: number): number {
  if (pageCount < 1) return 1;
  return Math.min(Math.max(1, page), pageCount);
}

export function pageRange(page: number, pageSize: number, total: number): { start: number; end: number } {
  if (total <= 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}
