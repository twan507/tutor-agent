import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  FILLED_MANIFEST,
  ICON_MANIFEST,
  MASCOT_MANIFEST,
  checkDir,
  checkSvg,
} from "./check-icons.mjs";
import { ICONS } from "./icon-manifest.mjs";

const VALID_OUTLINE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="correct"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>';
const VALID_FILLED =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="correct"><path fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm4.62 5.88a.9.9 0 0 0-1.27 0L10.6 13.6l-2-2a.9.9 0 1 0-1.27 1.27l2.63 2.64a.9.9 0 0 0 1.28 0l5.38-5.36a.9.9 0 0 0 0-1.27Z"/></svg>';

describe("checkSvg outline", () => {
  it("icon hợp lệ → không lỗi", () => {
    expect(checkSvg("correct", VALID_OUTLINE, "outline")).toEqual([]);
  });
  it("viewBox sai → lỗi", () => {
    const bad = VALID_OUTLINE.replace("0 0 24 24", "0 0 32 32");
    expect(checkSvg("correct", bad, "outline")).not.toEqual([]);
  });
  it("hex trần ngoài whitelist → lỗi", () => {
    const bad = VALID_OUTLINE.replace('stroke="currentColor"', 'stroke="#FF0000"');
    expect(checkSvg("correct", bad, "outline")).not.toEqual([]);
  });
  it("thiếu aria-label đúng tên → lỗi", () => {
    const bad = VALID_OUTLINE.replace('aria-label="correct"', 'aria-label="khac"');
    expect(checkSvg("correct", bad, "outline").join(" ")).toContain("aria-label");
  });
  it("sai độ dày nét → lỗi", () => {
    const bad = VALID_OUTLINE.replace('stroke-width="1.75"', 'stroke-width="2"');
    expect(checkSvg("correct", bad, "outline").join(" ")).toContain("1.75");
  });
  it("tên ngoài manifest → lỗi", () => {
    expect(checkSvg("random-icon", VALID_OUTLINE, "outline")).not.toEqual([]);
  });
});

describe("checkSvg filled", () => {
  it("icon filled hợp lệ → không lỗi", () => {
    expect(checkSvg("correct", VALID_FILLED, "filled")).toEqual([]);
  });
  it("filled thiếu fill=currentColor → lỗi", () => {
    const bad = VALID_FILLED.replace('fill="currentColor"', "");
    expect(checkSvg("correct", bad, "filled")).not.toEqual([]);
  });
});

describe("checkDir", () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = undefined;
  });

  it("thiếu file trong manifest → lỗi 'thiếu'", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-check-"));
    fs.writeFileSync(path.join(tmpDir, "correct.svg"), VALID_OUTLINE);
    expect(checkDir(tmpDir, "outline", ["correct", "hint"])).toEqual(["outline: thiếu hint.svg"]);
  });

  it("file ngoài manifest → lỗi 'thừa'", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-check-"));
    fs.writeFileSync(path.join(tmpDir, "correct.svg"), VALID_OUTLINE);
    fs.writeFileSync(path.join(tmpDir, "stray.svg"), VALID_OUTLINE);
    expect(checkDir(tmpDir, "outline", ["correct"])).toEqual(["outline: thừa stray.svg"]);
  });

  it("đủ đúng file hợp lệ → mảng lỗi rỗng", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "brand-check-"));
    fs.writeFileSync(path.join(tmpDir, "correct.svg"), VALID_OUTLINE);
    fs.writeFileSync(
      path.join(tmpDir, "hint.svg"),
      VALID_OUTLINE.replaceAll('aria-label="correct"', 'aria-label="hint"'),
    );
    expect(checkDir(tmpDir, "outline", ["correct", "hint"])).toEqual([]);
  });
});

describe("manifest", () => {
  // Icon nay sinh từ Tabler theo icon-manifest.mjs (spec 2026-08-07).
  // Pose "flying" đã bỏ cùng motif đường bay (07/08/2026) → còn 3 pose × 2 nền.
  it("outline phủ toàn bộ khái niệm, filled chỉ phủ khái niệm khai filled", () => {
    expect(ICON_MANIFEST).toHaveLength(127);
    expect(FILLED_MANIFEST).toHaveLength(93);
    expect(FILLED_MANIFEST.every((n) => ICONS[n].filled)).toBe(true);
    expect(ICON_MANIFEST.filter((n) => !ICONS[n].filled)).toHaveLength(34);
  });
  it("mascot: 6 file, không còn pose flying", () => {
    expect(MASCOT_MANIFEST).toHaveLength(6);
    expect(MASCOT_MANIFEST.some((n) => n.includes("flying"))).toBe(false);
  });
});
