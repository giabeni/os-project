import { Scheduler } from "./os/Scheduler";
import * as input from "readline";

const scheduler = new Scheduler();

const readline = input.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(`Digite o caminho para o arquivo de entrada: `, (filePath) => {
  console.log(`Lendo o arquivo ${filePath}...\n\n`);
  scheduler.readInputs(filePath);
  scheduler.run();
  readline.close();
});
