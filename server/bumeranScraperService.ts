import { JobOffer, TargetRole } from '../src/types/job';

export interface BumeranAvisoRaw {
  id: number;
  titulo: string;
  detalle?: string;
  empresa?: string;
  confidencial?: boolean;
  localizacion?: string;
  modalidadTrabajo?: 'Presencial' | 'Híbrido' | 'Remoto' | string;
  tipoTrabajo?: string;
  fechaPublicacion?: string;
  fechaHoraPublicacion?: string;
  cantidadVacantes?: number;
  portal?: string;
}

export interface BumeranSearchResponse {
  number: number; // Current page index
  size: number; // Page size
  total: number; // Total items count
  content: BumeranAvisoRaw[];
}

export interface BumeranScrapeOptions {
  query: string;
  roleCategory: TargetRole;
  pageSize?: number;
  maxPages?: number;
  remoteOnly?: boolean;
}

export class BumeranScraperService {
  private readonly baseUrl = 'https://www.bumeran.com.pe';
  private readonly searchApiUrl = 'https://www.bumeran.com.pe/api/avisos/searchV2';
  private readonly siteId = 'BMPE'; // Official site identifier for Bumeran Perú

  private readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'x-site-id': 'BMPE',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    Origin: 'https://www.bumeran.com.pe',
    Referer: 'https://www.bumeran.com.pe/empleos-busqueda.html',
    'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
  };

  /**
   * Genera el slug canónico normalizado para construir la URL directa del aviso.
   * Formato oficial Bumeran: https://www.bumeran.com.pe/empleos/[slug]-[id].html
   */
  public generateCanonicalUrl(title: string, id: number | string): string {
    const slug = title
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${this.baseUrl}/empleos/${slug}-${id}.html`;
  }

  /**
   * Limpia el HTML del campo detalle para obtener un resumen de texto legible.
   */
  private cleanHtml(html: string): string {
    return html
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Extrae los requisitos clave a partir del texto de la oferta.
   */
  private extractRequirements(text: string): string[] {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const reqs: string[] = [];

    let inReqSection = false;
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (
        lower.includes('requisitos') ||
        lower.includes('perfil') ||
        lower.includes('que buscamos') ||
        lower.includes('¿que buscamos?')
      ) {
        inReqSection = true;
        continue;
      }
      if (
        inReqSection &&
        (lower.includes('beneficios') ||
          lower.includes('ofrecemos') ||
          lower.includes('funciones') ||
          lower.includes('responsabilidades'))
      ) {
        inReqSection = false;
        break;
      }
      if (inReqSection && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 10)) {
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 5 && clean.length < 150) {
          reqs.push(clean);
        }
      }
    }

    if (reqs.length === 0) {
      return [
        'Experiencia en el área solicitada',
        'Postulación activa y verificada en Bumeran Perú',
        'Disponibilidad para la modalidad indicada',
      ];
    }

    return reqs.slice(0, 4);
  }

  /**
   * Realiza la consulta paginada a la API oficial de Bumeran Perú con selectores y filtros.
   */
  public async scrapeJobsByRole(options: BumeranScrapeOptions): Promise<JobOffer[]> {
    const {
      query,
      roleCategory,
      pageSize = 10,
      maxPages = 2,
      remoteOnly = false,
    } = options;

    const allOffers: JobOffer[] = [];
    const nowLimaHour = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

    for (let page = 0; page < maxPages; page++) {
      try {
        const url = `${this.searchApiUrl}?pageSize=${pageSize}&page=${page}&sort=RECIENTES`;

        const requestBody = {
          query,
          filtros: [] as any[],
          internacional: false,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: this.defaultHeaders,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(4500),
        });

        if (!response.ok) {
          console.warn(`[BumeranScraper] Bumeran respondió con status ${response.status} en la página ${page}`);
          break;
        }

        const data: BumeranSearchResponse = await response.json();

        if (!data.content || data.content.length === 0) {
          break;
        }

        for (const item of data.content) {
          const rawMod = item.modalidadTrabajo || 'Presencial';
          const isRemote =
            rawMod === 'Remoto' ||
            item.titulo.toLowerCase().includes('remoto') ||
            (item.detalle && item.detalle.toLowerCase().includes('100% remoto'));

          const isHybrid = rawMod === 'Híbrido' || (item.detalle && item.detalle.toLowerCase().includes('hibrido'));

          // If remoteOnly is requested, filter accordingly
          if (remoteOnly && !isRemote && !isHybrid) {
            continue;
          }

          let remoteType: '100% Remoto' | 'Híbrido Flexible' | 'Remoto Perú' = 'Remoto Perú';
          if (isRemote) {
            remoteType = '100% Remoto';
          } else if (isHybrid) {
            remoteType = 'Híbrido Flexible';
          }

          const directCanonicalUrl = this.generateCanonicalUrl(item.titulo, item.id);
          const rawDescription = item.detalle ? this.cleanHtml(item.detalle) : '';
          const summaryText = rawDescription.slice(0, 260) + (rawDescription.length > 260 ? '...' : '');
          const requirements = this.extractRequirements(rawDescription);

          allOffers.push({
            id: `bum-${item.id}`,
            roleCategory,
            title: item.titulo.trim(), // Exact original title from Bumeran post
            originalRoleTitle: item.titulo.trim(),
            company: item.confidencial ? 'Empresa Confidencial (Bumeran)' : (item.empresa || 'Empresa Reclutadora').trim(),
            location: item.localizacion || 'Lima, Perú',
            remoteType,
            descriptionSummary: summaryText || `Oferta activa en Bumeran Perú para el puesto de ${item.titulo}.`,
            keyRequirements: requirements,
            salaryRange: 'Ver especificación en la publicación',
            sourceUrl: directCanonicalUrl, // Direct, non-redirecting canonical URL
            sourceName: 'Bumeran',
            postedDate: item.fechaPublicacion || 'Publicado recientemente',
            scannedAtHour: nowLimaHour,
          });
        }

        // If we reached the last page according to total elements
        const totalFetched = (page + 1) * pageSize;
        if (totalFetched >= data.total) {
          break;
        }
      } catch (err) {
        console.warn(`[BumeranScraper] Error en paginación ${page} para query "${query}":`, err);
        break;
      }
    }

    return allOffers;
  }

  /**
   * Realiza un escaneo integral para todos los roles objetivo en Bumeran Perú en paralelo.
   */
  public async scrapeAllTargetRoles(remoteOnly: boolean = false): Promise<JobOffer[]> {
    const targetRolesQueries: Array<{ role: TargetRole; query: string }> = [
      { role: 'Product Manager', query: 'product manager' },
      { role: 'Jefe de Compras', query: 'jefe de compras' },
      { role: 'Jefe de Categoría', query: 'jefe de categoria' },
      { role: 'Jefe de Línea', query: 'jefe de linea' },
      { role: 'Jefe de Abastecimiento', query: 'jefe de abastecimiento' },
      { role: 'Jefe de Comex', query: 'jefe de comex' },
      { role: 'Jefe de Importaciones', query: 'jefe de importaciones' },
    ];

    const results: JobOffer[] = [];

    const tasks = targetRolesQueries.map(async (item) => {
      try {
        const offers = await this.scrapeJobsByRole({
          query: item.query,
          roleCategory: item.role,
          pageSize: 4,
          maxPages: 1,
          remoteOnly,
        });
        return offers;
      } catch (err) {
        console.warn(`[BumeranScraper] Error scraping ${item.query}:`, err);
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

export const bumeranScraperService = new BumeranScraperService();
