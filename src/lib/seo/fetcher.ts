import { RawFetchResult, AuxiliaryFetchResult } from "@/types/audit";
import { isIpSafe, validateAndNormalizeUrl } from "@/lib/security/ssrf";

const MAX_RESPONSE_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB limit
const FETCH_TIMEOUT_MS = 8000; // 8 seconds
const MAX_REDIRECTS = 5;
const USER_AGENT = "RanklyBot/1.0 (+https://rankly.app/bot; SEO Audit & Diagnostic Crawler)";

export class FetchError extends Error {
  public statusCode: number;
  public userMessage: string;

  constructor(message: string, statusCode = 500, userMessage?: string) {
    super(message);
    this.name = "FetchError";
    this.statusCode = statusCode;
    this.userMessage = userMessage || message;
  }
}

/**
 * Server-side website fetcher with SSRF checking on every redirect hop, timeout limits, and size caps.
 */
export async function fetchWebsite(targetUrl: string): Promise<RawFetchResult> {
  const norm = validateAndNormalizeUrl(targetUrl);
  if (!norm.isValid || !norm.normalizedUrl) {
    throw new FetchError(norm.error || "Invalid URL", 400, "Please provide a valid, publicly reachable website address.");
  }

  let currentUrl = norm.normalizedUrl;
  let redirectCount = 0;
  const startTime = Date.now();

  while (redirectCount <= MAX_REDIRECTS) {
    const parsed = new URL(currentUrl);
    if (!isIpSafe(parsed.hostname)) {
      throw new FetchError("Blocked target host (SSRF)", 422, "Access to private, loopback, or cloud internal destinations is blocked.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      // Handle Redirects manually to enforce SSRF validation at every hop
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new FetchError("Redirect missing location header", 422, "The website returned an invalid redirect response.");
        }

        const nextUrl = new URL(location, currentUrl).toString();
        const nextNorm = validateAndNormalizeUrl(nextUrl);
        if (!nextNorm.isValid || !nextNorm.normalizedUrl) {
          throw new FetchError("Invalid redirect target URL", 422, "Redirected to an invalid or blocked location.");
        }

        currentUrl = nextNorm.normalizedUrl;
        redirectCount++;
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        // If status was not 200, report status error
        if (!response.ok) {
          throw new FetchError(
            `Server responded with HTTP ${response.status}`,
            422,
            `The target server responded with HTTP status ${response.status} (${response.statusText || "Error"}).`
          );
        }
        throw new FetchError(
          `Unsupported Content-Type: ${contentType}`,
          422,
          "The target URL does not appear to return an HTML webpage."
        );
      }

      // Read buffer with max size limit
      const reader = response.body?.getReader();
      if (!reader) {
        throw new FetchError("Unable to read response stream", 500, "Could not read data from target website.");
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_RESPONSE_SIZE_BYTES) {
            reader.cancel();
            throw new FetchError("Page payload exceeds maximum limit (2.5MB)", 422, "The webpage HTML exceeds the maximum allowed scan size of 2.5MB.");
          }
          chunks.push(value);
        }
      }

      const htmlBuffer = Buffer.concat(chunks);
      const html = htmlBuffer.toString("utf-8");
      const responseTimeMs = Date.now() - startTime;

      const headerObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headerObj[key.toLowerCase()] = val;
      });

      return {
        url: norm.normalizedUrl,
        finalUrl: currentUrl,
        status: response.status,
        statusText: response.statusText,
        headers: headerObj,
        html,
        responseTimeMs,
        redirectCount,
        isHttps: currentUrl.startsWith("https:"),
        contentType,
        contentLength: totalBytes,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new FetchError("Connection timed out", 408, "The target website took too long to respond (8 second timeout exceeded).");
      }
      if (err instanceof FetchError) {
        throw err;
      }
      throw new FetchError(`Network failure: ${err.message}`, 422, "Unable to establish connection to the target website. Check the domain name.");
    }
  }

  throw new FetchError("Exceeded maximum redirects", 422, "The website caused too many redirect loops (> 5 redirects).");
}

/**
 * Lightweight helper to fetch robots.txt and sitemap.xml
 */
export async function fetchAuxiliaryFile(baseUrl: string, path: string): Promise<AuxiliaryFetchResult> {
  try {
    const urlObj = new URL(path, baseUrl);
    const check = validateAndNormalizeUrl(urlObj.toString());
    if (!check.isValid || !check.normalizedUrl) {
      return { url: urlObj.toString(), status: 400, content: "", exists: false };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(check.normalizedUrl, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      return {
        url: check.normalizedUrl,
        status: res.status,
        content: text.slice(0, 100000), // Max 100KB preview
        exists: true,
      };
    }

    return {
      url: check.normalizedUrl,
      status: res.status,
      content: "",
      exists: false,
    };
  } catch {
    return { url: `${baseUrl}${path}`, status: 500, content: "", exists: false };
  }
}
