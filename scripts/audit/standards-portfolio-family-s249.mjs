const TEXAS_HIGH_SCHOOL_SECTIONS = new Set([39, 40, 41, 42, 47]);

export function standardsExactCodeKey(framework, candidateCode) {
  const authority = String(framework ?? "").trim();
  const code = String(candidateCode ?? "").trim();
  if (!authority || !code) throw new Error("Standards portfolio keys require a framework and candidate code.");
  return `${authority}|${code}`;
}

export function standardsParentFamily(framework, candidateCode) {
  const authority = String(framework ?? "").trim();
  const code = String(candidateCode ?? "").trim();
  standardsExactCodeKey(authority, code);

  // AP unit locators share one authoritative course framework. Exact unit contracts remain
  // subgroups inside the family and are never used to infer an edge-level decision.
  if (authority.startsWith("AP-")) return authority;

  // The four/five high-school domain locators belong to one authority-level HS family.
  if (authority === "CCSS-MATH" && /^HS[A-Z]+$/.test(code)) return "HS";
  if (authority === "CA-CCSSM" && /^CA-HS[A-Z]+$/.test(code)) return "CA-HS";
  if (authority === "NY-NGLS-MATH" && /^NY-HS[A-Z]+$/.test(code)) return "NY-HS";
  if (authority === "FL-BEST-MATH" && /^MA\.HS\.HS[A-Z]+$/.test(code)) return "MA.HS";

  // Texas Chapter 111 uses separate course sections beneath the high-school mathematics family.
  if (authority === "TX-TEKS-MATH") {
    const section = Number(code.match(/^§111\.(\d+)$/)?.[1]);
    if (TEXAS_HIGH_SCHOOL_SECTIONS.has(section)) return "§111.HS";
  }

  // The two bounded kindergarten exact benchmarks share the K.OA.A cluster contract.
  if (authority === "CCSS-MATH" && /^K\.OA\.A\.\d+$/.test(code)) return "K.OA.A";

  return code;
}

export function standardsFamilyKey(framework, candidateCode) {
  const authority = String(framework ?? "").trim();
  return `${authority}|${standardsParentFamily(authority, candidateCode)}`;
}
