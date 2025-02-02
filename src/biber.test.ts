import {buildDownloadURL, downloadBiber, validBiberVersion} from './biber.js'
import {existsSync} from 'fs'
import {join, resolve} from 'path'
import {platform} from 'os'
import {execFileSync} from 'child_process'

const tempDir = join(__dirname, 'runner', 'temp')
process.env.RUNNER_TEMP = tempDir

describe('build download link', () => {
  test("should build download link on windows for biber version 'current'", () => {
    const url = buildDownloadURL('current', 'biber-MSWIN64.zip', 'win32')

    expect(url).toBe(
      'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/current/binaries/Windows/biber-MSWIN64.zip/download'
    )
  })

  test('should build download link on mac os biber <=2.16', () => {
    const url = buildDownloadURL('2.16', 'biber-darwin_x86_64.tar.gz', 'darwin')

    expect(url).toBe(
      'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.16/binaries/OSX_Intel/biber-darwin_x86_64.tar.gz/download'
    )
  })

  test('should build download link on mac os biber >=2.17', () => {
    const url = buildDownloadURL('2.17', 'biber-darwin_x86_64.tar.gz', 'darwin')

    expect(url).toBe(
      'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.17/binaries/MacOS/biber-darwin_x86_64.tar.gz/download'
    )
  })

  test('should build download link on mac os biber 2.18', () => {
    const url = buildDownloadURL('2.18', 'biber-darwin_x86_64.tar.gz', 'darwin')

    expect(url).toBe(
      'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.18/binaries/MacOS/biber-darwin_x86_64.tar.gz/download'
    )
  })
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
  const fileExtension = platform() === 'win32' ? '.exe' : ''
  const expectedBinaryPath = resolve(biberPath, `biber${fileExtension}`)

  expect(existsSync(biberPath)).toBe(true)
  expect(existsSync(expectedBinaryPath)).toBe(true)
  expect(execFileSync(expectedBinaryPath, ['--version']).toString()).toMatch(
    /2\.15/
  )
}, 40000)

test('download invalid biber version, should install current', async () => {
  const biberPath = await downloadBiber('invalidVersion')
  const fileExtension = platform() === 'win32' ? '.exe' : ''
  const expectedBinaryPath = resolve(biberPath, `biber${fileExtension}`)

  expect(existsSync(biberPath)).toBe(true)
  expect(existsSync(expectedBinaryPath)).toBe(true)
}, 40000)
