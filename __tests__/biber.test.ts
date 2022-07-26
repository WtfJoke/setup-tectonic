import {buildDownloadURL, downloadBiber, validBiberVersion} from '../src/biber'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {execFileSync} from 'child_process'

const tempDir = path.join(__dirname, 'runner', 'temp')
process.env['RUNNER_TEMP'] = tempDir

test('build download link', async () => {
  const url = buildDownloadURL('current', 'biber-MSWIN64.zip', 'win32')

  expect(url).toBe(
    'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/current/binaries/Windows/biber-MSWIN64.zip/download'
  )
})

test('get biber version from invalid input', () => {
  expect(validBiberVersion('')).toBe('current')
  expect(validBiberVersion('invalid')).toBe('current')
  expect(validBiberVersion('current')).toBe('current')
  expect(validBiberVersion('; sudo shutdown -h now #')).toBe('current')
  expect(validBiberVersion('" SELECT * FROM super_secret_db ;')).toBe('current')
})

test('get biber version as major.minor', () => {
  expect(validBiberVersion('   1.0 ')).toBe('1.0')
  expect(validBiberVersion('  0.6.0 ')).toBe('0.6')
  expect(validBiberVersion(' v 0.0.0 ')).toBe('0.0')
})

test('get biber version as major.minor.patch', () => {
  expect(validBiberVersion('   0.9.8 ')).toBe('0.9.8')
  expect(validBiberVersion('   0.9.9  ')).toBe('0.9.9')
  expect(validBiberVersion('   0.9.10 ')).toBe('0.9.10')
  expect(validBiberVersion(' 2.16.1')).toBe('2.16.1')
})

test('download non-existant biber version', async () => {
  await expect(downloadBiber('0.0.0')).rejects.toThrow()
}, 20000)

test('download specific biber version', async () => {
  const biberPath = await downloadBiber('2.15')
  const fileExtension = os.platform() == 'win32' ? '.exe' : ''
  const expectedBinaryPath = path.resolve(biberPath, 'biber' + fileExtension)

  expect(fs.existsSync(biberPath)).toBe(true)
  expect(fs.existsSync(expectedBinaryPath)).toBe(true)
  expect(execFileSync(expectedBinaryPath, ['--version']).toString()).toMatch(
    /2\.15/
  )
}, 40000)

test('download invalid biber version, should install current', async () => {
  const biberPath = await downloadBiber('invalidVersion')
  const fileExtension = os.platform() == 'win32' ? '.exe' : ''
  const expectedBinaryPath = path.resolve(biberPath, 'biber' + fileExtension)

  expect(fs.existsSync(biberPath)).toBe(true)
  expect(fs.existsSync(expectedBinaryPath)).toBe(true)
}, 40000)
