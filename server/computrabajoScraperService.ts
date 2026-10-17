import { JobOffer, TargetRole } from '../src/types/job';

export interface ComputrabajoScrapeOptions {
  query: string;
  roleCategory: TargetRole;
  slugPath?: string;
  maxPages?: number;
  teletrabajoOnly?: boolean;
}

export class ComputrabajoScraperService {
  private readonly baseUrl = 'https://pe.computrabajo.com';

  private readonly defaultHeaders = {
    authority: 'pe.computrabajo.com',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  /**
   * Decodifica entidades HTML habituales de Computrabajo (ej. &#xFA; -> ú, &amp; -> &)
   */
  private decodeEntities(str: string): string {
    return str
      .replace(/&#xFA;/gi, 'ú')
      .replace(/&#xDA;/gi, 'Ú')
      .replace(/&#xF3;/gi, 'ó')
      .replace(/&#xD3;/gi, 'Ó')
      .replace(/&#xED;/gi, 'í')
      .replace(/&#xCD;/gi, 'Í')
      .replace(/&#xE9;/gi, 'é')
      .replace(/&#xC9;/gi, 'É')
      .replace(/&#xE1;/gi, 'á')
      .replace(/&#xC1;/gi, 'Á')
      .replace(/&#xF1;/gi, 'ñ')
      .replace(/&#xD1;/gi, 'Ñ')
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x2B;/gi, '+')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extrae ofertas directas desde el HTML de Computrabajo usando los selectores específicos.
   */
  private parseArticlesFromHtml(html: string, roleCategory: TargetRole, nowLimaHour: string, isTeletrabajo: boolean): JobOffer[] {
    const rawArticles = [...html.matchAll(/<article[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g)];
    const jobs: JobOffer[] = [];

    for (const match of rawArticles) {
      const articleId = match[1];
      const content = match[2];

      // 1. Selector de Enlace Canónico y Título Oficial
      const linkMatch =
        content.match(/class="[^"]*js-o-link[^"]*"[^>]*href="([^"]+)"/) ||
        content.match(/href="([^"]+)"[^>]*class="[^"]*js-o-link[^"]*"/);

      const titleMatch = content.match(/class="[^"]*js-o-link[^"]*"[^>]*>([^<]+)/);

      if (!linkMatch || !titleMatch) continue;

      const rawTitle = titleMatch[1].trim();
      const decodedTitle = this.decodeEntities(rawTitle);

      // Limpieza de anclas para generar el enlace canónico directo oficial
      const rawHref = linkMatch[1].split('#')[0];
      const canonicalUrl = rawHref.startsWith('http')
        ? rawHref
        : `${this.baseUrl}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;

      // 2. Selector de Empresa
      const companyMatch =
        content.match(/offer-grid-article-company-url[^>]*>([^<]+)/) ||
        content.match(/class="[^"]*fc_base t_ellipsis[^"]*"[^>]*>([^<]+)/);

      const rawCompany = companyMatch ? companyMatch[1].trim() : 'Empresa Confidencial (Computrabajo)';
      const decodedCompany = this.decodeEntities(rawCompany);

      // 3. Selector de Ubicación
      const locMatch = content.match(/<p class="fs16 fc_base mt5">[\s\S]*?<span class="mr10">([^<]+)<\/span>/);
      const decodedLoc = locMatch ? this.decodeEntities(locMatch[1].trim()) : 'Lima, Perú';

      // 4. Selector de Salario
      const salaryMatch = content.match(/<span class="dIB mr10">[\s\S]*?<span class="icon i_salary"><\/span>([^<]+)<\/span>/);
      const salaryStr = salaryMatch ? this.decodeEntities(salaryMatch[1].trim()) : 'Ver especificación en la publicación';

      // 5. Selector de Fecha
      const dateMatch = content.match(/<p class="fs13 fc_aux mt15">([\s\S]*?)<\/p>/);
      const postedStr = dateMatch ? this.decodeEntities(dateMatch[1].replace(/<[^>]*>/g, '').trim()) : 'Publicado recientemente';

      // 6. Modalidad Remota / Teletrabajo
      const hasTeletrabajoTag = content.toLowerCase().includes('teletrabajo') || isTeletrabajo || decodedTitle.toLowerCase().includes('remoto');

      jobs.push({
        id: `ct-${articleId}`,
        roleCategory,
        title: decodedTitle, // Exact original title from Computrabajo
        originalRoleTitle: decodedTitle,
        company: decodedCompany,
        location: decodedLoc,
        remoteType: hasTeletrabajoTag ? '100% Remoto' : 'Remoto Perú',
        descriptionSummary: `Convocatoria oficial en Computrabajo Perú para ${decodedTitle} en ${decodedCompany} (${decodedLoc}). Postulación directa habilitada.`,
        keyRequirements: [
          'Experiencia comprobada en el rol',
          'Postulación directa abierta en Computrabajo Perú',
          'Disponibilidad para la modalidad indicada',
        ],
        salaryRange: salaryStr,
        sourceUrl: canonicalUrl, // Direct, canonical URL (e.g. https://pe.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-...)
        sourceName: 'Computrabajo',
        postedDate: postedStr,
        scannedAtHour: nowLimaHour,
      });
    }

    return jobs;
  }

  /**
   * Consulta paginada a Computrabajo Perú para un rol específico.
   */
  public async scrapeJobsByRole(options: ComputrabajoScrapeOptions): Promise<JobOffer[]> {
    const {
      query,
      roleCategory,
      slugPath,
      maxPages = 2,
      teletrabajoOnly = false,
    } = options;

    const allOffers: JobOffer[] = [];
    const nowLimaHour = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

    for (let page = 1; page <= maxPages; page++) {
      try {
        let url: string;
        if (slugPath && page === 1 && !teletrabajoOnly) {
          url = `${this.baseUrl}${slugPath}`;
        } else if (slugPath && !teletrabajoOnly) {
          url = `${this.baseUrl}${slugPath}?p=${page}`;
        } else {
          const encQuery = encodeURIComponent(query);
          url = `${this.baseUrl}/empleos-en-peru?q=${encQuery}${teletrabajoOnly ? '&teletrabajo=1' : ''}&p=${page}`;
        }

        const res = await fetch(url, {
          headers: this.defaultHeaders,
          signal: AbortSignal.timeout(4500),
        });

        if (!res.ok) {
          console.warn(`[ComputrabajoScraper] Error ${res.status} al consultar ${url}`);
          break;
        }

        const html = await res.text();
        const parsedJobs = this.parseArticlesFromHtml(html, roleCategory, nowLimaHour, teletrabajoOnly);

        if (parsedJobs.length === 0) {
          break;
        }

        allOffers.push(...parsedJobs);
      } catch (err) {
        console.warn(`[ComputrabajoScraper] Excepción en página ${page} para query "${query}":`, err);
        break;
      }
    }

    // Filtrar relevancia para evitar falsos positivos
    const roleKeywords: Record<TargetRole, string[]> = {
      'Product Manager': ['product', 'manager', 'producto', 'owner', 'digital', 'líder', 'lider'],
      'Jefe de Compras': ['compras', 'compra', 'adquisiciones', 'abastecimiento', 'supply', 'logística', 'logistica'],
      'Jefe de Categoría': ['categoría', 'categoria', 'category', 'sourcing', 'marca', 'comercial'],
      'Jefe de Línea': ['línea', 'linea', 'producción', 'produccion', 'planta', 'marca', 'producto'],
      'Jefe de Abastecimiento': ['abastecimiento', 'suministros', 'supply', 'logística', 'logistica', 'almacén', 'almacen'],
      'Jefe de Comex': ['comex', 'comercio exterior', 'aduanas', 'internacional', 'exportación', 'importación'],
      'Jefe de Importaciones': ['importaciones', 'importación', 'importacion', 'comercio exterior', 'comex', 'compras internacionales'],
    };

    const targetKeywords = roleKeywords[roleCategory] || [];
    const relevantOffers = allOffers.filter((job) => {
      const lower = (job.title + ' ' + job.company).toLowerCase();
      return targetKeywords.some((kw) => lower.includes(kw));
    });

    return relevantOffers.length > 0 ? relevantOffers : allOffers.slice(0, 5);
  }

  /**
   * Ejecuta el scraping de todos los roles seleccionados en Computrabajo Perú en paralelo.
   */
  public async scrapeAllTargetRoles(teletrabajoOnly: boolean = false): Promise<JobOffer[]> {
    const roleQueries: Array<{ role: TargetRole; query: string; slugPath?: string }> = [
      { role: 'Product Manager', query: 'product manager', slugPath: '/trabajo-de-product-manager' },
      { role: 'Jefe de Compras', query: 'jefe de compras', slugPath: '/trabajo-de-jefe-de-compras' },
      { role: 'Jefe de Categoría', query: 'jefe de categoria', slugPath: '/trabajo-de-category-manager' },
      { role: 'Jefe de Línea', query: 'jefe de linea' },
      { role: 'Jefe de Abastecimiento', query: 'jefe de abastecimiento', slugPath: '/trabajo-de-jefe-de-abastecimiento' },
      { role: 'Jefe de Comex', query: 'jefe de comex', slugPath: '/trabajo-de-jefe-de-comercio-exterior' },
      { role: 'Jefe de Importaciones', query: 'jefe de importaciones', slugPath: '/trabajo-de-jefe-de-importaciones' },
    ];

    const results: JobOffer[] = [];

    const tasks = roleQueries.map(async (item) => {
      try {
        const offers = await this.scrapeJobsByRole({
          query: item.query,
          roleCategory: item.role,
          slugPath: item.slugPath,
          maxPages: 1,
          teletrabajoOnly,
        });
        return offers.slice(0, 3);
      } catch (err) {
        console.warn(`[ComputrabajoScraper] Error scraping ${item.query}:`, err);
        return [];
      }
    });

    const settled = await Promise.allSettled(tasks);
    for (const item of settled) {
      if (item.status === 'fulfilled') {
        results.push(...item.value);
      }
    }

    return results;
  }
}

export const computrabajoScraperService = new ComputrabajoScraperService();
