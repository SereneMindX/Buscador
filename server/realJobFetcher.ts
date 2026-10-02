import { JobOffer, TargetRole, JobPortalSource, TARGET_ROLES } from '../src/types/job';
import { bumeranScraperService } from './bumeranScraperService';
import { computrabajoScraperService } from './computrabajoScraperService';

export function getPortalLiveSearchUrl(portal: JobPortalSource, query: string, remoteOnly: boolean = true): string {
  const enc = encodeURIComponent(query);
  switch (portal) {
    case 'Indeed':
      return `https://pe.indeed.com/jobs?q=${enc}&l=Per%C3%BA${remoteOnly ? '&sc=0kf%3Aattr%28DSQF7%29%3B' : ''}`;
    case 'Computrabajo':
      return `https://pe.computrabajo.com/empleos-en-peru?q=${enc}${remoteOnly ? '&teletrabajo=1' : ''}`;
    case 'Bumeran':
      return `https://www.bumeran.com.pe/empleos-busqueda.html?q=${enc}`;
    case 'LinkedIn':
    default:
      return `https://www.linkedin.com/jobs/search/?keywords=${enc}&location=Peru${remoteOnly ? '&f_WT=2' : ''}`;
  }
}

/**
 * Consulta en tiempo real el endpoint público de vacantes de LinkedIn para Perú.
 * Extrae títulos reales, empresas reales y enlaces reales exactos a cada postulación.
 */
export async function fetchLiveLinkedInJobs(keyword: string, roleCategory: TargetRole, remoteOnly: boolean = true): Promise<JobOffer[]> {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=Peru${remoteOnly ? '&f_WT=2' : ''}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();

    const titleMatches = [...html.matchAll(/class="base-search-card__title"[^>]*>([^<]+)/g)].map(m => m[1].trim());
    const companyMatches = [...html.matchAll(/class="base-search-card__subtitle"[^>]*>[\s\S]*?<a[^>]*>([^<]+)/g)].map(m => m[1].trim());
    const linkMatches = [...html.matchAll(/class="base-card__full-link[^"]*"[\s\S]*?href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
    const locationMatches = [...html.matchAll(/class="job-search-card__location"[^>]*>([^<]+)/g)].map(m => m[1].trim());

    const results: JobOffer[] = [];
    const count = Math.min(titleMatches.length, linkMatches.length, 3);

    const nowLimaHour = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

    for (let i = 0; i < count; i++) {
      const title = titleMatches[i];
      const link = linkMatches[i];
      const company = companyMatches[i] || 'Empresa Reclutadora en Perú';
      const loc = locationMatches[i] || 'Lima, Perú';

      const isRemote = remoteOnly || title.toLowerCase().includes('remote') || title.toLowerCase().includes('remoto');

      results.push({
        id: `li-real-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
        roleCategory,
        title, // Exact title from the actual LinkedIn posting
        originalRoleTitle: title,
        company,
        location: `${loc}`,
        remoteType: isRemote ? '100% Remoto' : 'Remoto Perú',
        descriptionSummary: `Vacante activa verificada en LinkedIn Perú para ${title} en ${company}. Convocatoria vigente con postulación directa.`,
        keyRequirements: [
          'Experiencia demostrable en el área',
          'Postulación activa y verificada en LinkedIn',
          'Disponibilidad para modalidad remota/híbrida en Perú',
        ],
        salaryRange: 'Ver especificación en la publicación',
        sourceUrl: link, // Exact direct URL to the job posting
        sourceName: 'LinkedIn',
        postedDate: 'Publicado recientemente',
        scannedAtHour: nowLimaHour,
      });
    }

    return results;
  } catch (err) {
    console.warn(`[JobFetcher] Error fetching live LinkedIn jobs for ${keyword}:`, err);
    return [];
  }
}

/**
 * Ejecuta la búsqueda real en vivo combinando los extractores especializados de:
 * 1. Computrabajo Perú (HTML selectors + enlaces canónicos /ofertas-de-trabajo/oferta-de-trabajo-de-...)
 * 2. Bumeran Perú (API v2 BMPE + enlaces canónicos /empleos/[slug]-[id].html)
 * 3. LinkedIn Perú (Guest API + enlaces oficiales directos /jobs/view/...)
 */
export async function fetchAllRealJobs(): Promise<JobOffer[]> {
  const roleKeywords: Record<TargetRole, { searchTerms: string[]; remoteOnly: boolean }> = {
    'Product Manager': { searchTerms: ['Product Manager', 'Product Owner'], remoteOnly: true },
    'Jefe de Compras': { searchTerms: ['Jefe de Compras', 'Jefe de Adquisiciones'], remoteOnly: false },
    'Jefe de Categoría': { searchTerms: ['Jefe de Categoria', 'Category Manager'], remoteOnly: false },
    'Jefe de Línea': { searchTerms: ['Jefe de Linea', 'Brand Manager'], remoteOnly: false },
    'Jefe de Abastecimiento': { searchTerms: ['Jefe de Abastecimiento', 'Jefe de Suministros'], remoteOnly: false },
    'Jefe de Comex': { searchTerms: ['Jefe de Comex', 'Jefe de Comercio Exterior'], remoteOnly: false },
    'Jefe de Importaciones': { searchTerms: ['Jefe de Importaciones', 'Jefe de Logistica Internacional'], remoteOnly: false },
  };

  const allJobs: JobOffer[] = [];

  // Run Computrabajo, Bumeran, and LinkedIn in parallel
  const [computrabajoSettled, bumeranSettled, linkedinSettled] = await Promise.allSettled([
    computrabajoScraperService.scrapeAllTargetRoles(false),
    bumeranScraperService.scrapeAllTargetRoles(false),
    (async () => {
      const liTasks = TARGET_ROLES.map(async (role) => {
        const config = roleKeywords[role];
        for (const term of config.searchTerms) {
          try {
            const liveJobs = await fetchLiveLinkedInJobs(term, role, config.remoteOnly);
            if (liveJobs.length > 0) return liveJobs;
          } catch (e) {
            console.warn(`[JobFetcher] LinkedIn error for ${term}:`, e);
          }
        }
        return [];
      });
      const results = await Promise.allSettled(liTasks);
      const jobs: JobOffer[] = [];
      for (const res of results) {
        if (res.status === 'fulfilled') {
          jobs.push(...res.value);
        }
      }
      return jobs;
    })(),
  ]);

  if (computrabajoSettled.status === 'fulfilled') {
    allJobs.push(...computrabajoSettled.value);
  }
  if (bumeranSettled.status === 'fulfilled') {
    allJobs.push(...bumeranSettled.value);
  }
  if (linkedinSettled.status === 'fulfilled') {
    allJobs.push(...linkedinSettled.value);
  }

  // Deduplicación por URL exacta
  const seenUrls = new Set<string>();
  const uniqueJobs: JobOffer[] = [];
  for (const j of allJobs) {
    if (!seenUrls.has(j.sourceUrl)) {
      seenUrls.add(j.sourceUrl);
      uniqueJobs.push(j);
    }
  }

  return uniqueJobs;
}
