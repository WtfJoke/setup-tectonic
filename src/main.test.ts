import { type ExecFileSyncOptions, execFileSync } from "node:child_process";
import { join } from "node:path";
import { env, execPath } from "node:process";

// shows how the runner will run a javascript action with env / stdout protocol
test.skip("runs", () => {
  env["INPUT_GITHUB-TOKEN"] = "IAMAGITHUBTOKEN";
  const np = execPath;
  const ip = join(__dirname, "..", "lib", "main.js");
  const options: ExecFileSyncOptions = {
    env,
  };
  console.log(execFileSync(np, [ip], options).toString());
});
