import type { ResumeData } from "@/lib/schemas";

export type ResumeContactKind =
  | "location"
  | "phone"
  | "email"
  | "linkedin"
  | "portfolio"
  | "link";

export type ResumeContactItem = {
  kind: ResumeContactKind;
  text: string;
  href?: string;
};

type NormalizedExternalUrl = {
  canonical: string;
  href: string;
  hostname: string;
};

const serviceLabels: ReadonlyArray<[string, string]> = [
  ["linkedin.com", "LinkedIn"],
  ["github.com", "GitHub"],
  ["gitlab.com", "GitLab"],
  ["behance.net", "Behance"],
  ["dribbble.com", "Dribbble"],
  ["stackoverflow.com", "Stack Overflow"],
  ["kaggle.com", "Kaggle"],
  ["medium.com", "Medium"],
  ["substack.com", "Publications"],
  ["twitter.com", "X"],
  ["x.com", "X"],
];

function normalizedExternalUrl(
  rawValue: string | null | undefined
): NormalizedExternalUrl | null {
  const value = (rawValue ?? "").trim();
  if (!value) return null;

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  if (hasScheme && !/^https?:/i.test(value)) return null;

  const candidate = /^https?:\/\//i.test(value)
    ? value
    : `https://${value.replace(/^\/\//, "")}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!hostname || !hostname.includes(".")) return null;

    url.hash = "";
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const canonicalPath = pathname === "/" ? "" : pathname;

    return {
      canonical: `${hostname}${canonicalPath}`.toLowerCase(),
      href: url.toString().replace(/\/$/, ""),
      hostname,
    };
  } catch {
    return null;
  }
}

function genericLinkLabel(hostname: string): string {
  const service = serviceLabels.find(
    ([domain]) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  return service?.[1] ?? "Website";
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getResumeContactItems(
  header: ResumeData["header"]
): ResumeContactItem[] {
  const items: ResumeContactItem[] = [];
  const seenUrls = new Set<string>();
  const usedLinkLabels = new Map<string, number>();

  const addText = (
    kind: "location" | "phone",
    rawValue: string | null | undefined
  ) => {
    const text = (rawValue ?? "").trim();
    if (text) items.push({ kind, text });
  };

  const addExternalLink = (
    kind: "linkedin" | "portfolio" | "link",
    rawValue: string | null | undefined,
    preferredLabel?: string
  ) => {
    const normalized = normalizedExternalUrl(rawValue);
    if (!normalized || seenUrls.has(normalized.canonical)) return;

    seenUrls.add(normalized.canonical);
    const baseLabel =
      preferredLabel ?? genericLinkLabel(normalized.hostname);
    const occurrence = (usedLinkLabels.get(baseLabel) ?? 0) + 1;
    usedLinkLabels.set(baseLabel, occurrence);

    items.push({
      kind,
      text: occurrence === 1 ? baseLabel : `${baseLabel} ${occurrence}`,
      href: normalized.href,
    });
  };

  addText("location", header.location);
  addText("phone", header.phone);

  const email = (header.email ?? "").trim();
  if (email) {
    items.push({
      kind: "email",
      text: email,
      href: validEmail(email) ? `mailto:${email}` : undefined,
    });
  }

  addExternalLink("linkedin", header.linkedin, "LinkedIn");
  addExternalLink("portfolio", header.portfolio, "Portfolio");

  for (const link of header.links ?? []) {
    addExternalLink("link", link);
  }

  return items;
}
