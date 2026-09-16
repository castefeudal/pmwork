export function findUnknownBackupFields(raw: unknown, parsed: unknown, path = "$", limit = 25): string[] {
  if (limit <= 0) return [];
  if (Array.isArray(raw)) {
    if (!Array.isArray(parsed)) return [];
    const issues: string[] = [];
    for (let index = 0; index < raw.length && issues.length < limit; index++) {
      issues.push(
        ...findUnknownBackupFields(
          raw[index],
          parsed[index],
          `${path}[${index}]`,
          limit - issues.length,
        ),
      );
    }
    return issues;
  }
  if (!raw || typeof raw !== "object" || !parsed || typeof parsed !== "object") return [];

  const rawRecord = raw as Record<string, unknown>;
  const parsedRecord = parsed as Record<string, unknown>;
  const issues: string[] = [];
  for (const key of Object.keys(rawRecord)) {
    if (!(key in parsedRecord)) {
      issues.push(`${path}.${key}`);
      if (issues.length >= limit) break;
      continue;
    }
    issues.push(
      ...findUnknownBackupFields(
        rawRecord[key],
        parsedRecord[key],
        `${path}.${key}`,
        limit - issues.length,
      ),
    );
    if (issues.length >= limit) break;
  }
  return issues;
}

export function assertNoUnknownBackupFields(raw: unknown, parsed: unknown) {
  const fields = findUnknownBackupFields(raw, parsed);
  if (fields.length) {
    throw new Error(
      `Backup contains fields this PMWORK version cannot preserve: ${fields.join(", ")}`,
    );
  }
}
