/**
 * Serper.dev – Google Search API Service
 * ----------------------------------------
 * Provides real Google search results for the Yadawy Smart Search.
 * Automatically falls back to local search when quota is exceeded or API fails.
 *
 * Base URL : https://google.serper.dev
 * API Key  : stored in VITE_SERPER_API_KEY (.env.local)
 */

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY as string;
const SERPER_BASE_URL = 'https://google.serper.dev';

/** Whether the Serper quota has been exhausted this session */
let serperQuotaExhausted = false;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  imageUrl?: string;
}

export interface SerperShoppingResult {
  title: string;
  source: string;
  link: string;
  price?: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
}

export interface SerperSearchResponse {
  organic: SerperOrganicResult[];
  shopping?: SerperShoppingResult[];
  searchParameters?: { q: string };
  source: 'serper' | 'fallback';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if Serper is available (key exists + quota not exhausted)
 */
export function isSerperAvailable(): boolean {
  return Boolean(SERPER_API_KEY) && !serperQuotaExhausted;
}

/**
 * Mark quota as exhausted so we stop calling the API in subsequent searches.
 */
function markQuotaExhausted() {
  serperQuotaExhausted = true;
  console.warn('[Serper] Quota exhausted – switching to local fallback search.');
}

// ─── Main Search Functions ───────────────────────────────────────────────────

/**
 * Perform a Google web search via Serper.
 * Returns an empty organic array (fallback) on quota error or network failure.
 */
export async function serperWebSearch(query: string, numResults = 6): Promise<SerperSearchResponse> {
  if (!isSerperAvailable()) {
    return { organic: [], source: 'fallback' };
  }

  try {
    const res = await fetch(`${SERPER_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} حرف يدوية مصر`,
        gl: 'eg',        // Egypt
        hl: 'ar',        // Arabic
        num: numResults
      })
    });

    // Quota exceeded or unauthorized
    if (res.status === 429 || res.status === 403 || res.status === 402) {
      markQuotaExhausted();
      return { organic: [], source: 'fallback' };
    }

    if (!res.ok) {
      console.error(`[Serper] HTTP ${res.status}`);
      return { organic: [], source: 'fallback' };
    }

    const data = await res.json();

    const organic: SerperOrganicResult[] = (data.organic ?? []).map((r: any, i: number) => ({
      title: r.title ?? '',
      link: r.link ?? '',
      snippet: r.snippet ?? '',
      position: r.position ?? i + 1,
      imageUrl: r.imageUrl
    }));

    return { organic, source: 'serper', searchParameters: data.searchParameters };
  } catch (err) {
    console.error('[Serper] Network error:', err);
    return { organic: [], source: 'fallback' };
  }
}

/**
 * Perform a Google Shopping search via Serper (للمنتجات الحرفية).
 * Returns empty array on failure.
 */
export async function serperShoppingSearch(query: string, numResults = 4): Promise<SerperShoppingResult[]> {
  if (!isSerperAvailable()) return [];

  try {
    const res = await fetch(`${SERPER_BASE_URL}/shopping`, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${query} حرف يدوية`,
        gl: 'eg',
        hl: 'ar',
        num: numResults
      })
    });

    if (res.status === 429 || res.status === 403 || res.status === 402) {
      markQuotaExhausted();
      return [];
    }

    if (!res.ok) return [];

    const data = await res.json();
    return (data.shopping ?? []).map((r: any) => ({
      title: r.title ?? '',
      source: r.source ?? '',
      link: r.link ?? '',
      price: r.price,
      imageUrl: r.imageUrl,
      rating: r.rating,
      ratingCount: r.ratingCount
    }));
  } catch {
    return [];
  }
}
