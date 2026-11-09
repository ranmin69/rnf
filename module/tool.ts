import type { CompareFn, FileInfo, SortType, ToolModule } from "../types.ts";

/**
 * 文件名数字比较器：交给 Intl 内置的数字感知排序（natural order），
 * 保证 2 < 10 < 100；对 "129-1" 这类非纯数字名同样有全序，永不返回 NaN。
 */
const numericCollator = new Intl.Collator(undefined, { numeric: true });

const sortStrategies: Record<SortType, CompareFn> = {
  "bt-asc": (a: FileInfo, b: FileInfo): number => a.birthtime - b.birthtime,
  "bt-desc": (a: FileInfo, b: FileInfo): number =>
    b.birthtime - a.birthtime,
  "mt-asc": (a: FileInfo, b: FileInfo): number => a.mtime - b.mtime,
  "mt-desc": (a: FileInfo, b: FileInfo): number => b.mtime - a.mtime,
  "at-asc": (a: FileInfo, b: FileInfo): number => a.atime - b.atime,
  "at-desc": (a: FileInfo, b: FileInfo): number => b.atime - a.atime,
  "n-asc": (a: FileInfo, b: FileInfo): number => numericCollator.compare(String(a.fileName), String(b.fileName)),
  "n-desc": (a: FileInfo, b: FileInfo): number => numericCollator.compare(String(b.fileName), String(a.fileName)),
  "": (_a: FileInfo, _b: FileInfo): number => 0,
};

/**
 * 排序方法
 */
const fileSort = (arr: FileInfo[], type: SortType): FileInfo[] => {
  const compareFn: CompareFn = sortStrategies[type] ?? sortStrategies[""];
  return [...arr].sort(compareFn);
};

const tool: ToolModule = {
  fileSort,
};

export { tool as default, fileSort };
