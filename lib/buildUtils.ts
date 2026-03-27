import chalk from "chalk";
import readline from "node:readline";

type Label = "ERROR" | "SUCCESS" | "WARNING" | "HEADER" | "INFO";

/**
 * Print a message with a label and color:
 *  - ERROR   → red
 *  - SUCCESS → green
 *  - WARNING → yellow
 */
export const log = (msg: string, label: Label = "INFO"): void => {
    switch (label) {
        case "ERROR":
            console.log(chalk.red(`[${label}]`), msg);
            break;
        case "SUCCESS":
            console.log(chalk.green(`[${label}]`), msg);
            break;
        case "WARNING":
            console.log(chalk.yellow(`[${label}]`), msg);
            break;
        case "HEADER":
            console.log(chalk.blue(`${'='.repeat(88)}`));
            console.log(chalk.blue(msg));
            console.log(chalk.blue(`${'='.repeat(88)}`));
            break;
        default:
            console.log(chalk.dim(`[${label}]`), chalk.dim(msg));
    }
};

export const logStat = (s = "") => {
  if (!process.stdout.isTTY) {
    process.stdout.write(s + "\n"); // fallback when not a TTY
    return;
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(s);
};