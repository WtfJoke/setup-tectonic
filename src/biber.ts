import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import os from 'os'
import {BIBER_DL_BASE_PATH, BINARIES, DOWNLOAD} from './constants'
import {coerce, satisfies} from 'semver'

export const validBiberVersion = (biberVersion: string) => {
  const biberSemVer = coerce(biberVersion)

  if (biberSemVer === null) {
    core.debug(
      `Invalid biber version: "${biberVersion}". Defaulting to latest version`
    )
    return 'current'
  }
  if (biberSemVer.patch !== 0) {
    return biberSemVer.version
  }

  return `${biberSemVer.major}.${biberSemVer.minor}`
}

export const downloadBiber = async (biberVersion: string) => {
  const validVersion = validBiberVersion(biberVersion)
  const platform = os.platform()
  const fileName = mapOsToFileName(platform)
  const url = buildDownloadURL(validVersion, fileName, platform)
  core.debug(`Downloading Biber from ${url}`)
  const archivePath = await tc.downloadTool(url)

  core.debug('Extracting Biber')
  let biberPath
  if (fileName.endsWith('.zip')) {
    biberPath = await tc.extractZip(archivePath)
  } else if (fileName.endsWith('.tar.gz')) {
    biberPath = await tc.extractTar(archivePath)
  }

  core.debug(`Biber path is ${biberPath}`)

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
  return mappings[platform] || platform
}

const mapOsToFileName = (platform: string) => {
  const platformFileNames: Record<string, string> = {
    win32: 'biber-MSWIN64.zip',
    darwin: 'biber-darwin_x86_64.tar.gz',
    linux: 'biber-linux_x86_64.tar.gz'
  }
  return platformFileNames[platform]
}

/**
 * Versions beginning with 2.17 uses 'MacOS' instead of 'OSX_Intel' as their platform identifier.
 * @see https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.17/ compared to https://sourceforge.net/projects/biblatex-biber/files/biblatex-biber/2.16/
 * @param version - the validated biber version (semver or 'current')
 * @returns true if using the new naming scheme
 */
const isUsingNewMacOsNaming = (version: string) =>
  version === 'current' ||
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  satisfies(coerce(version)!, '>=2.17')
