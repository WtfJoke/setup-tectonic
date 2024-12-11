import {env, execPath} from 'process'
import {join} from 'path'
import {execFileSync, ExecFileSyncOptions} from 'child_process'

// shows how the runner will run a javascript action with env / stdout protocol
// eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
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
