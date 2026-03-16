type MaybeRecord = Record<string, unknown>;

const isObject = (value: unknown): value is MaybeRecord => typeof value === "object" && value !== null;

export const extractList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isObject(payload)) {
    return [];
  }

  const candidates = [payload.items, payload.content, payload.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  if ("data" in payload) {
    return extractList<T>(payload.data);
  }

  return [];
};
