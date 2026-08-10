/**
 * CSV — an RFC 4180 codec, because rostering files come from other people's systems.
 *
 * Why hand-rolled rather than a dependency: the product invariant is "no
 * unnecessary third-party dependencies", and the surface we actually need is
 * small and precisely specified. What is NOT negotiable is correctness on the
 * shapes SIS exports really emit:
 *
 *   · quoted fields containing commas, CRLF, and doubled quotes ("" → ");
 *   · a UTF-8 BOM at the head of the file (Excel writes one, every time);
 *   · CRLF, LF, and CR line endings, mixed within one file;
 *   · a trailing newline, or none;
 *   · ragged rows — short rows pad, long rows are reported, never silently cut.
 *
 * The parser is a single-pass state machine over code units, so a 20k-row
 * enrollment file costs one allocation per field rather than one regex per
 * line. It never throws on malformed input: a lone quote inside an unquoted
 * field is data, not a parse error, because refusing a whole district import
 * over one stray character is worse behaviour than accepting it verbatim.
 */

/** A parsed row keyed by header name, plus its 1-based line number for diagnostics. */
export interface CsvRow {
  /** 1-based line number in the source file (the header is line 1). */
  line: number;
  values: Record<string, string>;
  /** Fields present on the line beyond the header's width. Empty when well-formed. */
  extra: string[];
}

export interface CsvTable {
  headers: string[];
  rows: CsvRow[];
}

/** Strip a UTF-8 BOM. Excel writes one; nothing downstream should ever see it. */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Split CSV text into raw fields-per-record. Handles quoted fields spanning
 * newlines, so this cannot be done line-by-line.
 */
export function parseCsvRecords(text: string): string[][] {
  const src = stripBom(text);
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;
  let sawAny = false;

  const endField = () => {
    record.push(field);
    field = "";
    sawAny = true;
  };
  const endRecord = () => {
    endField();
    records.push(record);
    record = [];
    sawAny = false;
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === "") {
      // A quote only opens a quoted field at the START of the field. Mid-field
      // quotes are literal data (SIS exports do emit them, e.g. O'Brien "Bo").
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      endField();
      continue;
    }
    if (ch === "\r") {
      if (src[i + 1] === "\n") i++;
      endRecord();
      continue;
    }
    if (ch === "\n") {
      endRecord();
      continue;
    }
    field += ch;
    sawAny = true;
  }
  // A trailing newline must not manufacture a phantom empty record.
  if (sawAny || field !== "" || record.length > 0) endRecord();
  return records;
}

/**
 * Parse into header-keyed rows. Short rows are padded with "" so consumers
 * never read `undefined`; long rows keep their surplus in `extra` so an import
 * can REPORT the shape problem instead of quietly discarding a column.
 */
export function parseCsv(text: string): CsvTable {
  const records = parseCsvRecords(text);
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map((h) => h.trim());
  const rows: CsvRow[] = [];
  for (let r = 1; r < records.length; r++) {
    const rec = records[r];
    // Skip fully blank lines — they are formatting, not records.
    if (rec.length === 1 && rec[0].trim() === "") continue;
    const values: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) values[headers[c]] = (rec[c] ?? "").trim();
    rows.push({ line: r + 1, values, extra: rec.slice(headers.length) });
  }
  return { headers, rows };
}

/** Quote a single field only when it needs it — smaller files, stable diffs. */
export function csvField(value: string | number | boolean | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Serialize rows in header order. CRLF because RFC 4180 says so and because
 * Excel on Windows is the most common destination for these exports.
 */
export function toCsv(headers: readonly string[], rows: ReadonlyArray<Record<string, unknown>>): string {
  const head = headers.map(csvField).join(",");
  const body = rows.map((row) => headers.map((h) => csvField(row[h] as string)).join(","));
  return [head, ...body].join("\r\n");
}
