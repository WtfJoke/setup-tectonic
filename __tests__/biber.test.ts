import {buildDownloadURL} from '../src/biber'

test('build download link', async () => {
  const url = buildDownloadURL('current', 'biber-MSWIN64.zip', 'win32')

  expect(url).toBe(
    'https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/current/binaries/Windows/biber-MSWIN64.zip/download'
  )
})
