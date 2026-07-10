import { Word, WordPack, LanguageLevel, WordCategory } from '@/core/types/game';

const LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CATEGORIES: WordCategory[] = [
  'food',
  'family',
  'travel',
  'work',
  'health',
  'nature',
  'education',
  'sports',
  'technology',
  'culture',
];
const SPANISH_RE = /^[a-záéíóúüñ]{3,12}$/;
const MAX_WORDS = 1000;

export type ImportResult = { ok: true; pack: WordPack } | { ok: false; error: string };

interface RawEntry {
  spanish?: unknown;
  english?: unknown;
  chinese?: unknown;
  level?: unknown;
  category?: unknown;
  exampleSentence?: unknown;
}

/**
 * 解析用户粘贴的词库文本，支持两种格式：
 * - JSON：单词对象数组，或含 name/words 的包对象
 * - CSV：表头 spanish,english,chinese[,level,category,exampleSentence]
 * 西语单词按填字规则校验（单词、3-12 个小写字母，可含重音与 ñ）。
 */
export function parsePackText(text: string, packId: string, fallbackName: string): ImportResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: '内容为空' };
  }

  let name = fallbackName;
  let entries: RawEntry[];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { ok: false, error: 'JSON 格式错误' };
    }
    if (Array.isArray(parsed)) {
      entries = parsed as RawEntry[];
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).words)) {
      const obj = parsed as { name?: unknown; words: RawEntry[] };
      if (typeof obj.name === 'string' && obj.name.trim()) {
        name = obj.name.trim();
      }
      entries = obj.words;
    } else {
      return { ok: false, error: 'JSON 需为单词数组或含 words 字段的对象' };
    }
  } else {
    entries = parseCsv(trimmed);
  }

  if (entries.length === 0) {
    return { ok: false, error: '没有解析到任何单词' };
  }
  if (entries.length > MAX_WORDS) {
    return { ok: false, error: `单词数量超过上限（${MAX_WORDS}）` };
  }

  const words: Word[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const spanish = typeof entry.spanish === 'string' ? entry.spanish.trim().toLowerCase() : '';
    const english = typeof entry.english === 'string' ? entry.english.trim() : '';
    const chinese = typeof entry.chinese === 'string' ? entry.chinese.trim() : '';
    if (!SPANISH_RE.test(spanish)) {
      return {
        ok: false,
        error: `第 ${i + 1} 个单词 "${spanish || '(空)'}" 不合法：需为 3-12 个小写西语字母的单个单词`,
      };
    }
    if (!english || !chinese) {
      return { ok: false, error: `第 ${i + 1} 个单词 "${spanish}" 缺少英文或中文翻译` };
    }
    if (seen.has(spanish)) {
      continue; // 跳过重复单词
    }
    seen.add(spanish);

    const level = LEVELS.includes(entry.level as LanguageLevel)
      ? (entry.level as LanguageLevel)
      : 'A1';
    const category = CATEGORIES.includes(entry.category as WordCategory)
      ? (entry.category as WordCategory)
      : 'culture';
    words.push({
      id: `${packId}_${String(words.length + 1).padStart(3, '0')}`,
      spanish,
      english,
      chinese,
      level,
      category,
      exampleSentence:
        typeof entry.exampleSentence === 'string' && entry.exampleSentence.trim()
          ? entry.exampleSentence.trim()
          : undefined,
    });
  }

  if (words.length < 5) {
    return { ok: false, error: `有效单词只有 ${words.length} 个，至少需要 5 个才能生成谜题` };
  }

  return {
    ok: true,
    pack: { id: packId, name, builtin: false, words },
  };
}

function parseCsv(text: string): RawEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [];
  }

  const first = lines[0].split(',').map(c => c.trim().toLowerCase());
  const hasHeader = first.includes('spanish');
  const columns = hasHeader
    ? first
    : ['spanish', 'english', 'chinese', 'level', 'category', 'examplesentence'];
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const FIELD_MAP: Record<string, keyof RawEntry> = {
    spanish: 'spanish',
    english: 'english',
    chinese: 'chinese',
    level: 'level',
    category: 'category',
    examplesentence: 'exampleSentence',
    example_sentence: 'exampleSentence',
    example: 'exampleSentence',
  };

  return dataLines.map(line => {
    const cells = line.split(',').map(c => c.trim());
    const entry: RawEntry = {};
    columns.forEach((col, i) => {
      const field = FIELD_MAP[col];
      if (field && cells[i]) {
        entry[field] = cells[i];
      }
    });
    return entry;
  });
}
