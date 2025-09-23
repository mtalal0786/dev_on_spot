// lib/buildQuery.js
// Return a RegExp for string fields. Don't use this on ObjectId fields.
export function like(value) {
  return value ? new RegExp(value, "i") : undefined;
}
