import {env, execPath} from 'process'
import {join} from 'path'
import {execFileSync, type ExecFileSyncOptions} from 'child_process'

// shows how the runner will run a javascript action with env / stdout protocol
test.skip('runs', () => {
  env['INPUT_GITHUB-TOKEN'] = 'IAMAGITHUBTOKEN'
  const np = execPath
  const ip = join(__dirname, '..', 'lib', 'main.js')
  const options: ExecFileSyncOptions = {
    env
  }
  // eslint-disable-next-line no-console
  console.log(execFileSync(np, [ip], options).toString())
})
