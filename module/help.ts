import config from "../config.ts";
import type { HelpModule } from "../types.ts";

/** 触发帮助输出的命令行标志 */
const HELP_FLAGS: readonly string[] = ["--help", "-h"];

/** 触发版本输出的命令行标志 */
const VERSION_FLAGS: readonly string[] = ["--version", "-v", "-V"];

// ANSI 终端样式代码
const RESET: string = "\u001b[0m";
const BOLD: string = "\u001b[1m";
const DIM: string = "\u001b[2m";
const RED: string = "\u001b[31m";
const GREEN: string = "\u001b[32m";
const YELLOW: string = "\u001b[33m";
const CYAN: string = "\u001b[36m";

/** 帮助信息正文 */
const helpText: string = `
${BOLD}${CYAN}rnf${RESET} ${GREEN}v${config.version}${RESET} ${DIM}— 批量文件重命名命令行工具${RESET}

${BOLD}${YELLOW}用法:${RESET}
  rnf ${GREEN}[选项]${RESET}

${BOLD}${YELLOW}选项:${RESET}
  ${GREEN}--name${RESET} <名称>   重命名后的基础文件名（不含序号和扩展名）${RED}[必填]${RESET}
  ${GREEN}--start${RESET} <数字>  序号起始数字，文件名从该数字开始递增 ${DIM}[默认: 1]${RESET}
  ${GREEN}--sort${RESET} <类型>   排序方式，决定文件处理顺序 ${DIM}[默认: 不排序]${RESET}
  ${GREEN}--ext${RESET} <数字>    保留扩展名的段数，2 可完整保留 .tar.gz ${DIM}[默认: 1]${RESET}
  ${GREEN}--dry-run${RESET}       仅预览重命名结果，不实际执行（试运行）
  ${GREEN}-v, --version${RESET}   显示当前版本号
  ${GREEN}-h, --help${RESET}      显示本帮助信息

${BOLD}${YELLOW}排序类型 (--sort):${RESET}
  ${CYAN}bt-asc${RESET}    按创建时间升序（最早创建的排最前）
  ${CYAN}bt-desc${RESET}   按创建时间降序（最晚创建的排最前）
  ${CYAN}mt-asc${RESET}    按修改时间升序（最早修改的排最前）
  ${CYAN}mt-desc${RESET}   按修改时间降序（最晚修改的排最前）
  ${CYAN}at-asc${RESET}    按访问时间升序（最早访问的排最前）
  ${CYAN}at-desc${RESET}   按访问时间降序（最晚访问的排最前）
  ${CYAN}n-asc${RESET}     按文件名数字升序（数字小的排最前）
  ${CYAN}n-desc${RESET}    按文件名数字降序（数字大的排最前）
  ${DIM}(不传)${RESET}    不排序，保持文件系统读取顺序

${BOLD}${YELLOW}示例:${RESET}
  ${DIM}$${RESET} rnf --name photo --start 1 --sort bt-asc
  ${DIM}$${RESET} rnf --start 69 --name 100097210_p --sort bt-desc
  ${DIM}$${RESET} rnf --name photo --start 1 --sort bt-asc --dry-run  ${DIM}# 预览${RESET}
  ${DIM}$${RESET} rnf --name backup --ext 2  ${DIM}# 保留 .tar.gz 两段扩展名${RESET}

${BOLD}${YELLOW}注意:${RESET}
  · 请在目标文件所在目录下运行命令
  · 只处理文件，子目录自动跳过
  · .jpg 扩展名会自动转为 .jpeg
  · 多段扩展名（如 .tar.gz）默认只保留最后一段，用 --ext 2 可完整保留
  · 采用两阶段重命名，避免新文件名覆盖旧文件
`;

/**
 * 判断命令行参数中是否包含帮助标志
 */
const isHelpRequest = (args: readonly string[]): boolean =>
  args.some((arg: string): boolean => HELP_FLAGS.includes(arg));

/**
 * 输出帮助信息到命令行
 */
const showHelp = (): void => {
  console.log(helpText);
};

/**
 * 判断命令行参数中是否包含版本标志
 */
const isVersionRequest = (args: readonly string[]): boolean =>
  args.some((arg: string): boolean => VERSION_FLAGS.includes(arg));

/**
 * 输出当前版本号到命令行
 */
const showVersion = (): void => {
  console.log(
    `${BOLD}${CYAN}rnf${RESET} ${GREEN}v${config.version}${RESET}`,
  );
};

const help: HelpModule = {
  isHelpRequest,
  showHelp,
  isVersionRequest,
  showVersion,
};

export {
  help as default,
  isHelpRequest,
  isVersionRequest,
  showHelp,
  showVersion,
};
