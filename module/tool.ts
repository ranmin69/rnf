import type { CompareFn, FileInfo, SortType, ToolModule } from "../types.ts";

const sortStrategies: Record<SortType, CompareFn> = {
  "bt-asc": (a: FileInfo, b: FileInfo): number => a.birthtime - b.birthtime,
  "bt-desc": (a: FileInfo, b: FileInfo): number =>
    b.birthtime - a.birthtime,
  "mt-asc": (a: FileInfo, b: FileInfo): number => a.mtime - b.mtime,
  "mt-desc": (a: FileInfo, b: FileInfo): number => b.mtime - a.mtime,
  "at-asc": (a: FileInfo, b: FileInfo): number => a.atime - b.atime,
  "at-desc": (a: FileInfo, b: FileInfo): number => b.atime - a.atime,
  "n-asc": (a: FileInfo, b: FileInfo): number =>
    Number(a.fileName) - Number(b.fileName),
  "n-desc": (a: FileInfo, b: FileInfo): number =>
    Number(b.fileName) - Number(a.fileName),
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
