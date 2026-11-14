import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { VIETNAM_ADMIN_UNITS } from '../src/data/vietnamAdministrativeUnits';
import type { SchoolDirectoryEntry } from '../src/types';

const sourceUrl = 'https://overpass.openstreetmap.fr/api/interpreter';
const query =
  '[out:json][timeout:120];area["ISO3166-1"="VN"]["admin_level"="2"]->.vn;nwr["amenity"="school"]["name"](area.vn);out center tags;';

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  tags: Record<string, string>;
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0110\u0111]/g, 'd')
    .toLowerCase()
    .replace(/^(tinh|thanh pho|tp\.?|province|city|phuong|xa|dac khu)\s*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const classifySchoolLevels = (
  name: string,
  tags: Record<string, string>
): SchoolDirectoryEntry['schoolLevel'][] => {
  const normalizedName = normalize(name);
  if (
    /mam non|mau giao|preschool|kindergarten|nursery|dai hoc|university|cao dang|college|hoc vien|trung tam|tieng anh|english|language center|giao duc thuong xuyen/.test(
      normalizedName
    )
  ) {
    return [];
  }

  const iscedLevels = (tags['isced:level'] || '')
    .split(/[;,\s-]+/)
    .map(Number)
    .filter((level) => Number.isInteger(level) && level >= 1 && level <= 3);
  if (iscedLevels.length > 0) {
    return [...new Set(iscedLevels)].map((level) =>
      level === 1 ? 'elementary' : level === 2 ? 'lower-secondary' : 'upper-secondary'
    );
  }

  const levels = new Set<SchoolDirectoryEntry['schoolLevel']>();
  if (/tieu hoc|primary|elementary|cap 1/.test(normalizedName)) levels.add('elementary');
  if (/thcs|trung hoc co so|middle school|lower secondary|cap 2/.test(normalizedName)) {
    levels.add('lower-secondary');
  }
  if (/thpt|trung hoc pho thong|high school|upper secondary|cap 3/.test(normalizedName)) {
    levels.add('upper-secondary');
  }
  return levels.size > 0 ? [...levels] : ['all'];
};

const provinceByName = new Map(
  VIETNAM_ADMIN_UNITS.map((province) => [normalize(province.name), province])
);

const response = await fetch(sourceUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'user-agent': 'BonBenSchoolDirectory/1.0 (web app)',
  },
  body: `data=${encodeURIComponent(query)}`,
  signal: AbortSignal.timeout(180_000),
});
if (!response.ok) {
  throw new Error(`Không tải được dữ liệu trường OSM (${response.status} ${response.statusText}).`);
}

const result = (await response.json()) as { elements?: OsmElement[] };
if (!Array.isArray(result.elements) || result.elements.length < 1000) {
  throw new Error(`Dữ liệu trường OSM không đầy đủ: nhận ${result.elements?.length || 0} mục.`);
}

const entries = new Map<string, SchoolDirectoryEntry>();

for (const element of result.elements) {
  const name = element.tags.name?.trim();
  const provinceName = element.tags['addr:province'] || element.tags['addr:city'];
  const wardName = element.tags['addr:ward'] || element.tags['addr:subdistrict'];
  if (!name || !provinceName || !wardName) continue;

  const province = provinceByName.get(normalize(provinceName));
  const ward = province?.wards.find((candidate) => normalize(candidate.name) === normalize(wardName));
  if (!province || !ward) continue;

  for (const schoolLevel of classifySchoolLevels(name, element.tags)) {
    const key = `${province.code}:${ward.code}:${normalize(name)}:${schoolLevel}`;
    if (entries.has(key)) continue;
    entries.set(key, {
      id: `osm-${element.type}-${element.id}-${schoolLevel}`,
      schoolName: name,
      schoolLevel,
      provinceOrCity: province.name,
      district: ward.name,
      source: 'openstreetmap',
      sourceId: `${element.type}/${element.id}`,
    });
  }
}

const schools = [...entries.values()];
if (schools.length < 100) {
  throw new Error(`Chỉ nhận được ${schools.length} trường có địa chỉ khớp tỉnh/phường hiện hành.`);
}

const generatedAt = new Date().toISOString();
const output = [
  'import type { SchoolDirectoryEntry } from \'../types\';',
  '',
  `export const VIETNAM_OSM_SCHOOLS_UPDATED_AT = ${JSON.stringify(generatedAt)};`,
  `export const VIETNAM_OSM_SCHOOLS_SOURCE = ${JSON.stringify(sourceUrl)};`,
  `export const VIETNAM_OSM_SCHOOLS: SchoolDirectoryEntry[] = ${JSON.stringify(schools, null, 2)};`,
  '',
].join('\n');

await writeFile(resolve('src/data/vietnamOsmSchools.ts'), output, 'utf8');
console.log(`Đã tạo ${schools.length} trường OSM có địa chỉ khớp tỉnh/phường hiện hành.`);
