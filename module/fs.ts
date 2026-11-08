import type { FileInfo, FsModule, RenameTask } from "../types.ts";

const { readDir, cwd, rename, stat, stdin } = Deno;

/**
 * 判断文件是否需要跳过（跳过时不执行任何重命名操作）。
 *
 * 跳过规则：
 * - 点文件：以 `.` 开头，如 `.gitignore`、`.env`、`.config.json`
 * - 无扩展名文件：不含 `.`（如 `LICENSE`、`Makefile`），或以 `.` 结尾（扩展名为空）
 */
const isSkippedFile = (name: string): boolean => {
  const dotIndex: number = name.lastIndexOf(".");
  return name.startsWith(".") || dotIndex <= 0 || dotIndex === name.length - 1;
};

/**
 * 读取文件夹所有子文件，并返回子文件信息。
 * 子目录、点文件、无扩展名文件均会被跳过。
 *
 * @param extCount 保留的扩展名段数（如 2 表示 `.tar.gz` 整体作为扩展名保留），小于 1 时按 1 处理，即只保留最后一段。
 */
const readDirFile = async (extCount: number): Promise<FileInfo[]> => {
  const fileInfoArr: FileInfo[] = [];
  const skippedNameArr: string[] = [];
  const currentDir: string = cwd();

  for await (const dirEntry of readDir(currentDir)) {
    const { name, isFile }: { name: string; isFile: boolean } = dirEntry;
    if (!isFile) continue;

    if (isSkippedFile(name)) {
      skippedNameArr.push(name);
      continue;
    }

    const nameArr: string[] = name.split(".");
    // 保留最后 extCount 段作为扩展名（如 extCount=2 时 backup.tar.gz 的扩展名为 tar.gz），
    // 段数上限为 nameArr.length - 1，确保基础名至少保留一段
    const extSegments: number = Math.min(Math.max(extCount, 1), nameArr.length - 1,);
    const fileType: string = nameArr.slice(nameArr.length - extSegments).join(".",);
    const fileName: string = nameArr.slice(0, nameArr.length - extSegments).join(".");

    const fileInfo: Deno.FileInfo = await stat(`${currentDir}/${name}`);

    const atime: number = fileInfo.atime ? new Date(fileInfo.atime).getTime() : 0;
    const mtime: number = fileInfo.mtime ? new Date(fileInfo.mtime).getTime() : 0;
    const birthtime: number = fileInfo.birthtime ? new Date(fileInfo.birthtime).getTime() : 0;

    fileInfoArr.push({
      name,
      fileName: isNaN(Number(fileName)) ? fileName : Number(fileName),
      fileType,
      atime,
      mtime,
      birthtime,
    });
  }

  if (skippedNameArr.length > 0) {
    const skippedCount: number = skippedNameArr.length;
    const skippedNames: string = skippedNameArr.join("、");
    console.log(`\u001b[2m已跳过 ${skippedCount} 个文件（点文件/无扩展名）：${skippedNames}\u001b[0m`,);
  }

  return fileInfoArr;
};

/**
 * 重命名方法（两阶段：先改为临时名，再改为最终名，避免文件名冲突覆盖）
 *
 * 执行流程：先列出全部「更改前后」的名字对比进行预览；
 * 若为 dry-run（--dry-run）模式则仅预览并返回；否则等待用户按 Enter 确认后，再真正执行重命名。
 */
const reName = async (
  fileArr: FileInfo[],
  baseName: string,
  start: number | string,
  dryRun: boolean,
): Promise<void> => {
  const currentDir: string = cwd();
  const TEMP_PREFIX: string = "__rename_tmp_";

  const tasks: RenameTask[] = fileArr.map(
    (file: FileInfo, index: number): RenameTask => {
      const extension: string = file.fileType === "jpg" ? "jpeg" : file.fileType;
      const newName: string = `${baseName}${Number(start) + index}.${extension}`;
      const tempName: string = `${TEMP_PREFIX}${index}_${Date.now()}.${extension}`;
      return { oldName: file.name, newName, tempName };
    },
  );

  // 更改名字前，用警告图标着重提示当前操作的文件夹路径
  console.log(`\u001b[1;31m⚠️  当前操作目录：${currentDir}\u001b[0m`);
  console.log("");

  // 预览：先列出所有更改前后的名字对比（橙色 \u001b[38;5;208m）
  console.log("\u001b[36m重命名预览：\u001b[0m");
  for (const task of tasks) {
    console.log(`📄：\u001b[38;5;208m${task.oldName}\u001b[0m => \u001b[38;5;208m${task.newName}\u001b[0m`,);
  }

  // dry-run 模式：仅预览，不执行任何重命名
  if (dryRun) {
    console.log(`\u001b[36m（--dry-run 预览模式，共 ${tasks.length} 个文件，未实际重命名）\u001b[0m`,);
    return;
  }

  // 正式模式：等待用户按 Enter 确认后再执行
  console.log("");
  console.log(`\u001b[33m确认以上 ${tasks.length} 个文件无误后，按 Enter 键开始重命名（Ctrl+C 取消）：\u001b[0m`,);
  await stdin.read(new Uint8Array(1024));

  // 第一阶段：旧文件名 => 临时文件名
  for (const task of tasks) {
    await rename(
      `${currentDir}/${task.oldName}`,
      `${currentDir}/${task.tempName}`,
    );
  }

  // 第二阶段：临时文件名 => 最终文件名
  for (const task of tasks) {
    await rename(`${currentDir}/${task.tempName}`, `${currentDir}/${task.newName}`,);
  }

  console.log(`\u001b[32m已重命名 ${tasks.length} 个文件\u001b[0m`, "✅");
};

const fs: FsModule = {
  isSkippedFile,
  readDirFile,
  reName,
};

export { fs as default, isSkippedFile, readDirFile, reName };
