class BrowserHashDigest {
  constructor(private readonly hex: string) {}

  toString(encoding?: string) {
    return encoding === "hex" || !encoding ? this.hex : this.hex;
  }
}

function hashString(value: string, seed: number) {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16_777_619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function hash(
  input: string | Uint8Array,
  options: { length?: number } = {},
) {
  const value =
    typeof input === "string"
      ? input
      : Array.from(input, (byte) => String.fromCharCode(byte)).join("");
  const requestedLength = Math.max(1, options.length ?? 8);
  const digest = `${hashString(value, 2_166_136_261)}${hashString(
    value,
    2_166_136_261 ^ 0x9e37_79b9,
  )}`;
  const hex = digest
    .repeat(Math.ceil((requestedLength * 2) / digest.length))
    .slice(0, requestedLength * 2);

  return new BrowserHashDigest(hex);
}
