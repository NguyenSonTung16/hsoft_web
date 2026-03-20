function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed) {
    return "/graphql";
  }

  if (trimmed.endsWith("/graphql")) {
    return trimmed;
  }

  return `${trimmed.replace(/\/+$/, "")}/graphql`;
}

export function getGraphQLEndpoint(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured?.trim()) {
    return normalizeEndpoint(configured);
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isAndroidClient = /Android/i.test(navigator.userAgent || "");

    // Android emulator cannot reach host machine through localhost.
    if (isAndroidClient && host === "localhost") {
      return "http://10.0.2.2:3000/graphql";
    }
  }

  return "/graphql";
}
