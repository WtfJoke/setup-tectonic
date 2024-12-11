import {Release, ReleaseAsset} from './release'

describe('release', () => {
  const tectonic012Assets: ReleaseAsset[] = [
    {
      name: 'tectonic-0.12.0-aarch64-apple-darwin.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-aarch64-apple-darwin.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-arm-unknown-linux-musleabihf.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-arm-unknown-linux-musleabihf.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-i686-unknown-linux-gnu.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-i686-unknown-linux-gnu.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-mips-unknown-linux-gnu.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-mips-unknown-linux-gnu.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-x86_64-apple-darwin.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-apple-darwin.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-x86_64-pc-windows-gnu.zip',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-gnu.zip'
    },
    {
      name: 'tectonic-0.12.0-x86_64-pc-windows-msvc.zip',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-msvc.zip'
    },
    {
      name: 'tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-x86_64-unknown-linux-musl.tar.gz',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-musl.tar.gz'
    },
    {
      name: 'tectonic-0.12.0-x86_64.AppImage',
      url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64.AppImage'
    }
  ]

  const tectonic012Release = new Release(
    81233082,
    'tectonic@0.12.0',
    tectonic012Assets,
    'tectonic 0.12.0'
  )

  describe('getAsset', () => {
    it('should return .zip filename on windows', () => {
      expect(tectonic012Release.getAsset('windows')).toStrictEqual({
        name: 'tectonic-0.12.0-x86_64-pc-windows-msvc.zip',
        url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-msvc.zip'
      })
    })

    it('should return .tar.gz filename on linux', () => {
      expect(tectonic012Release.getAsset('linux')).toStrictEqual({
        name: 'tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz',
        url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz'
      })
    })

    it('should return .tar.gz filename on mac', () => {
      expect(tectonic012Release.getAsset('darwin')).toStrictEqual({
        name: 'tectonic-0.12.0-x86_64-apple-darwin.tar.gz',
        url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-apple-darwin.tar.gz'
      })
    })

    it('should return .AppImage filename on linux releases up to 0.10.0', () => {
      const fakeTectonic010Assets = tectonic012Assets.map(asset => ({
        name: asset.name.replace(/0.12.0/g, '0.10.0'),
        url: asset.url.replace(/0.12.0/g, '0.10.0')
      }))
      const tectonic010Release = new Release(
        81233083,
        'tectonic@0.10.0',
        fakeTectonic010Assets,
        'tectonic 0.10.0'
      )
      expect(tectonic010Release.getAsset('linux')).toStrictEqual({
        name: 'tectonic-0.10.0-x86_64.AppImage',
        url: 'https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.10.0/tectonic-0.10.0-x86_64.AppImage'
      })
    })
  })
})
