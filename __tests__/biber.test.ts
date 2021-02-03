import {buildDownloadURL, downloadBiber} from '../src/biber'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const tempDir = path.join(__dirname, 'runner', 'temp')
process.env['RUNNER_TEMP'] = tempDir

test('build download link', async () => {
  const url = buildDownloadURL('current', 'biber-MSWIN64.zip', 'win32')

  expect(url).toBe(
    'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/current/binaries/Windows/biber-MSWIN64.zip/download'
  )
})

test('download specific biber version', async () => {
  const biberPath = await downloadBiber('2.15')
  const fileExtension = os.platform() == 'win32' ? '.exe' : ''
  const expectedBinaryPath = path.resolve(biberPath, 'biber' + fileExtension)

  expect(fs.existsSync(biberPath)).toBe(true)
  expect(fs.existsSync(expectedBinaryPath)).toBe(true)
}, 20000)

test('download invalid biber version, should install current', async () => {
  const biberPath = await downloadBiber('invalidVersion')
  const fileExtension = os.platform() == 'win32' ? '.exe' : ''
  const expectedBinaryPath = path.resolve(biberPath, 'biber' + fileExtension)

  expect(fs.existsSync(biberPath)).toBe(true)
  expect(fs.existsSync(expectedBinaryPath)).toBe(true)
}, 20000)
