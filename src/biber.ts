import {debug} from '@actions/core'
import {downloadTool, extractZip, extractTar} from '@actions/tool-cache'
import os from 'os'
import {BIBER_DL_BASE_PATH, BINARIES, DOWNLOAD} from './constants.js'
import {coerce, satisfies} from 'semver'

export const validBiberVersion = (biberVersion: string) => {
  const biberSemVer = coerce(biberVersion)

  if (biberSemVer === null) {
    debug(
      `Invalid biber version: "${biberVersion}". Defaulting to latest version`
    )
    return 'current'
  }
  if (biberSemVer.patch !== 0) {
    return biberSemVer.version
  }

  return `${biberSemVer.major.toFixed()}.${biberSemVer.minor.toFixed()}`
}

export const downloadBiber = async (biberVersion: string) => {
  const validVersion = validBiberVersion(biberVersion)
  const platform = os.platform()
  const fileName = mapOsToFileName(platform)
  const url = buildDownloadURL(validVersion, fileName, platform)
  debug(`Downloading Biber from ${url}`)
  const archivePath = await downloadTool(url)

  debug('Extracting Biber')
  let biberPath
  if (fileName.endsWith('.zip')) {
    biberPath = await extractZip(archivePath)
  } else if (fileName.endsWith('.tar.gz')) {
    biberPath = await extractTar(archivePath)
  }

  debug(`Biber path is ${biberPath ?? 'undefined'}`)
  if (!archivePath || !biberPath) {
    throw new Error(`Unable to download biber from ${url}`)
  }

  return biberPath
}

export const buildDownloadURL = (
  version: string,
  fileName: string,
  platform: string
) =>
  [
    BIBER_DL_BASE_PATH,
    version,
    BINARIES,
    mapOsToIdentifier(platform, version),
    fileName,
    DOWNLOAD
  ].join('/')

const mapOsToIdentifier = (platform: string, version: string) => {
  const mappings: Record<string, string> = {
    win32: 'Windows',
    darwin: isUsingNewMacOsNaming(version) ? 'MacOS' : 'OSX_Intel',
    linux: 'Linux'
  }
  return mappings[platform] ?? platform
}

const mapOsToFileName = (platform: string): string => {
  const platformFileNames: Record<string, string> = {
    win32: 'biber-MSWIN64.zip',
    darwin: 'biber-darwin_x86_64.tar.gz',
    linux: 'biber-linux_x86_64.tar.gz'
  }
  const fileName = platformFileNames[platform]
  if (!fileName) {
    throw new Error(`Unsupported platform for biber: ${platform}`)
  }
  return fileName
}

/**
 * Versions beginning with 2.17 uses 'MacOS' instead of 'OSX_Intel' as their platform identifier.
 * @see https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.17/ compared to https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.16/
 * @param version - the validated biber version (semver or 'current')
 * @returns true if using the new naming scheme
 */
const isUsingNewMacOsNaming = (version: string) =>
  version === 'current' || satisfies(coerce(version)!, '>=2.17')
