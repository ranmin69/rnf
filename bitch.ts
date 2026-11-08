import config from "./config.ts";
import { readDirFile, reName } from "./module/fs.ts";
import { fileSort } from "./module/tool.ts";
import {
  isHelpRequest,
  isVersionRequest,
  showHelp,
  showVersion,
} from "./module/help.ts";
import type { FileInfo, SortType } from "./types.ts";

const args: readonly string[] = Deno.args;
const argArr: readonly string[] = config.argArr;

/**
 * 命令行包含 --version / -v 时，输出当前版本号并退出
 */
if (isVersionRequest(args)) {
  showVersion();
  Deno.exit(0);
}

/**
 * 无参数或命令行包含 --help / -h 时，输出帮助信息并退出
 */
if (args.length === 0 || isHelpRequest(args)) {
  showHelp();
  Deno.exit(0);
}

/**
 * 获取命令行中的参数
 *
 * 当参数值缺失、或紧跟的是另一个选项（以 `-` 开头）时，视为未传值，
 * 返回 undefined 交由解构默认值兜底。
 * 如 `rename --name --start`：--name 取默认值 ""，--start 取默认值 "1"。
 */
function getArg(): (string | undefined)[] {
  return argArr.map((item: string): string | undefined => {
    const index: number = args.indexOf(item);
    if (index < 0) return undefined;

    const value: string | undefined = args[index + 1];
    return value === undefined || value.startsWith("-") ? undefined : value;
  });
}

const [
  fileName = "",
  fileStart = "1",
  sortType = "",
  extArg = "1",
]: (string | undefined)[] = getArg();

/**
 * 保留扩展名的段数：仅接受 >= 1 的整数，非法值（非数字 / 小于 1）兜底为 1，
 * 即默认只保留最后一段扩展名，与历史行为一致（如 2 可完整保留 .tar.gz）。
 */
const parsedExt: number = Number(extArg);
const extCount: number = Number.isInteger(parsedExt) && parsedExt >= 1 ? parsedExt : 1;

/** 是否为 dry-run 预览模式（布尔标志，无值） */
const dryRun: boolean = args.includes("--dry-run");

/**
 * 主程序
 */
try {
  console.log("开始读取文件夹中的所有文件", "⌛");

  const fileInfoArr: FileInfo[] = await readDirFile(extCount);
  const fileInfoArrNew: FileInfo[] = fileSort(fileInfoArr, sortType as SortType,);

  console.log("所有文件读取完成", "⌛");

  await reName(fileInfoArrNew, fileName, fileStart, dryRun);

  if (!dryRun) {
    console.log("\u001b[32m完成批量改名\u001b[0m", "👄👙👠");
  }
} catch (err: unknown) {
  const errMsg: string = err instanceof Error ? err.message : String(err);
  console.log(`❌：\u001b[31m ${errMsg} \u001b[0m`);
}
