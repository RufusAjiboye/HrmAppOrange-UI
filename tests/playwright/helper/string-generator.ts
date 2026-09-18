export function generateDynamicString(prefix = "user") {
  const guid = crypto.randomUUID();
  const suffix = guid.slice(-4);

  return `${prefix}-${suffix}`;
}
