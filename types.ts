/**
 * 全局类型定义：集中管理项目中所有 interface / type。
 * 各模块统一从此文件导入类型，避免类型分散与循环引用。
 */

/** 工具配置项 */
export interface Config {
  /** 当前工具版本号 */
  readonly version: string;
  readonly argArr: readonly string[];
}

/** 单个文件的信息（读取目录时构建，用于排序与重命名） */
export interface FileInfo {
  readonly name: string;
  readonly fileName: string | number;
  readonly fileType: string;
  readonly atime: number;
  readonly mtime: number;
  readonly birthtime: number;
}

/** 单次重命名任务（旧名 => 临时名 => 新名） */
export interface RenameTask {
  readonly oldName: string;
  readonly newName: string;
  readonly tempName: string;
}

/** fs 模块对外接口 */
export interface FsModule {
  readonly isSkippedFile: (name: string) => boolean;
  readonly readDirFile: (extCount: number) => Promise<FileInfo[]>;
  readonly reName: (
    fileArr: FileInfo[],
    baseName: string,
    start: number | string,
    dryRun: boolean,
  ) => Promise<void>;
}

/** 排序类型：前缀（bt/mt/at/n）+ 方向（asc/desc），空串表示不排序 */
export type SortType =
  | "bt-asc"
  | "bt-desc"
  | "mt-asc"
  | "mt-desc"
  | "at-asc"
  | "at-desc"
  | "n-asc"
  | "n-desc"
  | "";

/** 文件比较函数（用于 Array.sort） */
export type CompareFn = (a: FileInfo, b: FileInfo) => number;

/** tool 模块对外接口 */
export interface ToolModule {
  readonly fileSort: (arr: FileInfo[], type: SortType) => FileInfo[];
}

/**
 * 帮助信息模块：集中管理 --help / -h、--version / -v 的判定逻辑与输出内容。
 */
export interface HelpModule {
  readonly isHelpRequest: (args: readonly string[]) => boolean;
  readonly showHelp: () => void;
  readonly isVersionRequest: (args: readonly string[]) => boolean;
  readonly showVersion: () => void;
}
