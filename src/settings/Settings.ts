export class Settings {
  /* Memory */
  public static MEMORY_RELOCATING_TIME = 20;
  public static MEMORY_SIZE = 256;

  /* Disc */
  public static DISC_POSITIONING_TIME = 5;
  public static DISC_LATENCY_TIME = 5;
  public static DISC_TRANSFER_RATE = 40;

  /* Processor */
  public static PROCESSOR_QUANTUM = 50;

  /* Multiprogramming */
  public static MULTIPROGRAMMING_LIMIT = 4;

  /* Control */
  public static MEMORY_PRINT_SEGMENTS = true;
}

export const COLORS = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",
  fg: {
    Black: "\x1b[30m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m",
    Cyan: "\x1b[36m",
    White: "\x1b[37m",
    Crimson: "\x1b[38m",
  },
  bg: {
    Black: "\x1b[40m",
    Red: "\x1b[41m",
    Green: "\x1b[42m",
    Yellow: "\x1b[43m",
    Blue: "\x1b[44m",
    Magenta: "\x1b[45m",
    Cyan: "\x1b[46m",
    White: "\x1b[47m",
    Crimson: "\x1b[48m",
  },
 };
