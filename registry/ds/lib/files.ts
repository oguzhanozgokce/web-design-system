export interface FileDescriptor {
  name: string;
  size: number;
  type?: string;
}

export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'archive'
  | 'code'
  | 'other';

export type FileRejectionReason = 'type' | 'too-large' | 'too-small' | 'too-many';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileRules {
  acceptedFileTypes?: readonly string[];
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  fileCount?: number;
}

export interface DragTypeQuery {
  has(type: string | string[]): boolean;
}

const extensionsByKind: Record<Exclude<FileKind, 'other'>, string[]> = {
  image: [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'avif',
    'svg',
    'heic',
    'heif',
    'bmp',
    'tif',
    'tiff',
    'ico',
    'psd',
  ],
  video: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v', 'wmv', 'mpeg', 'mpg', '3gp'],
  audio: ['mp3', 'wav', 'ogg', 'oga', 'flac', 'aac', 'm4a', 'opus', 'wma', 'aiff', 'mid', 'midi'],
  pdf: ['pdf'],
  document: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown', 'pages', 'epub', 'tex'],
  spreadsheet: ['xls', 'xlsx', 'ods', 'csv', 'tsv', 'numbers'],
  presentation: ['ppt', 'pptx', 'odp', 'key'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'zst', 'dmg', 'iso'],
  code: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'json',
    'html',
    'htm',
    'css',
    'scss',
    'py',
    'rb',
    'go',
    'rs',
    'java',
    'kt',
    'swift',
    'c',
    'h',
    'cpp',
    'cs',
    'php',
    'sh',
    'yml',
    'yaml',
    'xml',
    'sql',
    'toml',
    'vue',
    'svelte',
  ],
};

const kindByExtension = new Map<string, FileKind>(
  Object.entries(extensionsByKind).flatMap(([kind, extensions]) =>
    extensions.map((extension) => [extension, kind as FileKind] as const),
  ),
);

const mimeByExtension: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  m4a: 'audio/x-m4a',
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const unknownDragType = 'application/octet-stream';

export function getFileExtension(name: string) {
  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : '';
}

export function getFileKind(file: Pick<FileDescriptor, 'name' | 'type'>): FileKind {
  const byExtension = kindByExtension.get(getFileExtension(file.name));
  if (byExtension) return byExtension;
  const type = file.type?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('text/')) return 'document';
  if (/zip|compressed|tar|rar|7z/.test(type)) return 'archive';
  return 'other';
}

export function isFileTypeAccepted(
  file: Pick<FileDescriptor, 'name' | 'type'>,
  acceptedFileTypes?: readonly string[],
) {
  if (!acceptedFileTypes?.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type?.toLowerCase() ?? '';
  return acceptedFileTypes.some((token) => {
    const accepted = token.trim().toLowerCase();
    if (accepted === '*' || accepted === '*/*') return true;
    if (accepted.startsWith('.')) return name.endsWith(accepted);
    if (accepted.endsWith('/*')) return type.startsWith(accepted.slice(0, -1));
    return type === accepted;
  });
}

export function mayAcceptDrag(types: DragTypeQuery, acceptedFileTypes?: readonly string[]) {
  if (!acceptedFileTypes?.length || types.has(unknownDragType)) return true;
  const candidates: string[] = [];
  for (const token of acceptedFileTypes) {
    const accepted = token.trim().toLowerCase();
    if (accepted.startsWith('.')) {
      const mime = mimeByExtension[accepted.slice(1)];
      if (!mime) return true;
      candidates.push(mime);
    } else {
      candidates.push(accepted);
    }
  }
  return types.has(candidates);
}

export function validateFiles(files: Iterable<File>, rules: FileRules = {}) {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  const room =
    rules.maxFiles == null ? Infinity : Math.max(0, rules.maxFiles - (rules.fileCount ?? 0));
  for (const file of files) {
    if (!isFileTypeAccepted(file, rules.acceptedFileTypes)) rejected.push({ file, reason: 'type' });
    else if (rules.maxSize != null && file.size > rules.maxSize)
      rejected.push({ file, reason: 'too-large' });
    else if (rules.minSize != null && file.size < rules.minSize)
      rejected.push({ file, reason: 'too-small' });
    else if (accepted.length >= room) rejected.push({ file, reason: 'too-many' });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

const sizeUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

const sizeFormatters = new Map<string, Intl.NumberFormat>();

function sizeFormatter(locale: string | undefined, unitIndex: number) {
  const key = `${locale ?? ''}:${unitIndex}`;
  let formatter = sizeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: sizeUnits[unitIndex],
      unitDisplay: unitIndex === 0 ? 'long' : 'short',
      maximumFractionDigits: unitIndex < 2 ? 0 : 1,
    });
    sizeFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatFileSize(bytes: number, locale?: string) {
  let value = Math.max(0, Number.isFinite(bytes) ? bytes : 0);
  let unitIndex = 0;
  while (unitIndex < sizeUnits.length - 1) {
    const digits = unitIndex < 2 ? 1 : 10;
    if (Math.round(value * digits) / digits < 1000) break;
    value /= 1000;
    unitIndex++;
  }
  return sizeFormatter(locale, unitIndex).format(value);
}

export function describeFileType(token: string) {
  const accepted = token.trim().toLowerCase();
  if (accepted.startsWith('.')) return accepted.slice(1).toUpperCase();
  const subtype = accepted.split('/')[1] ?? accepted;
  const short: Record<string, string> = {
    jpeg: 'JPG',
    'svg+xml': 'SVG',
    plain: 'TXT',
    markdown: 'MD',
    quicktime: 'MOV',
    mpeg: accepted.startsWith('audio/') ? 'MP3' : 'MPEG',
    msword: 'DOC',
    'vnd.ms-excel': 'XLS',
    'vnd.ms-powerpoint': 'PPT',
    'vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  };
  return short[subtype] ?? subtype.replace(/^x-/, '').replace(/\+.*$/, '').toUpperCase();
}
