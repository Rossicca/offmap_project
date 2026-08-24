import { spawn } from "node:child_process";

const children = [
  spawn(process.execPath, ["server/index.js"], { stdio: "inherit" }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], { stdio: "inherit" }),
];

const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

Promise.race(children.map((child) => new Promise((resolve) => child.on("exit", resolve))))
  .then((code) => {
    stop();
    process.exit(Number.isInteger(code) ? code : 0);
  });
