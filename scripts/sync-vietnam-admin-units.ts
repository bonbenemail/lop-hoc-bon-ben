import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceUrl = 'https://provinces.open-api.vn/api/v2/?depth=2';

interface ApiWard {
  code: number;
  name: string;
  division_type: string;
}

interface ApiProvince {
  code: number;
  name: string;
  division_type: string;
  wards: ApiWard[];
}

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Không tải được dữ liệu hành chính (${response.status} ${response.statusText}).`);
}

const provinces = (await response.json()) as ApiProvince[];
const wardCount = provinces.reduce((total, province) => total + province.wards.length, 0);
if (provinces.length !== 34 || wardCount < 3000) {
  throw new Error(`Dữ liệu không đầy đủ: nhận ${provinces.length} tỉnh/thành và ${wardCount} phường/xã.`);
}

const normalized = provinces.map((province) => ({
  code: province.code,
  name: province.name,
  divisionType: province.division_type,
  wards: province.wards.map((ward) => ({
    code: ward.code,
    name: ward.name,
    divisionType: ward.division_type,
  })),
}));

const generatedAt = new Date().toISOString();
const output = [
  'export interface VietnamAdministrativeUnit {',
  '  code: number;',
  '  name: string;',
  '  divisionType: string;',
  '}',
  '',
  'export interface VietnamProvince extends VietnamAdministrativeUnit {',
  '  wards: VietnamAdministrativeUnit[];',
  '}',
  '',
  `export const VIETNAM_ADMIN_UNITS_SOURCE = ${JSON.stringify(sourceUrl)};`,
  `export const VIETNAM_ADMIN_UNITS_UPDATED_AT = ${JSON.stringify(generatedAt)};`,
  `export const VIETNAM_ADMIN_UNITS: VietnamProvince[] = ${JSON.stringify(normalized, null, 2)};`,
  '',
].join('\n');

await writeFile(resolve('src/data/vietnamAdministrativeUnits.ts'), output, 'utf8');
console.log(`Đã tạo danh mục ${provinces.length} tỉnh/thành, ${wardCount} phường/xã/đặc khu từ ${sourceUrl}.`);
