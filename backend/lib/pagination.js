export function getPaging(query, defaults = { page: 1, pageSize: 15 }) {
  const page = Math.max(parseInt(query.page) || defaults.page, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize) || defaults.pageSize, 1), 100);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, limit: pageSize };
}
