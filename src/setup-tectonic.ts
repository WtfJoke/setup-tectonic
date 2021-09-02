import * as core from '@actions/core'
import * as fs from 'fs'
import * as io from '@actions/io'
import * as os from 'os'
import * as path from 'path'
import * as tc from '@actions/tool-cache'

import {downloadBiber} from './biber'
import {getTectonicRelease} from './release'
import {v4 as uuid} from 'uuid'

const mapOS = (osKey: string) => {
  const mappings: Record<string, string> = {
    win32: 'windows'
  }
  return mappings[osKey] || osKey
}

const downloadTectonic = async (url: string) => {
  core.debug(`Downloading Tectonic from ${url}`)
  const archivePath = await tc.downloadTool(url)

  core.debug('Extracting Tectonic')
  let tectonicPath
  if (url.endsWith('.zip')) {
    tectonicPath = await tc.extractZip(archivePath)
  } else if (url.endsWith('.tar.gz')) {
    tectonicPath = await tc.extractTar(archivePath)
  } else if (url.endsWith('.AppImage')) {
    tectonicPath = await createPathForAppImage(archivePath)
  }

  core.debug(`Tectonic path is ${tectonicPath}`)

  if (!archivePath || !tectonicPath) {
    throw new Error(`Unable to download tectonic from ${url}`)
  }

  return tectonicPath
}

const createPathForAppImage = async (appPath: string) => {
  const tectonicPath = await createTempFolder(appPath)
  const newAppPath = path.resolve(tectonicPath, 'tectonic')
  await io.mv(appPath, newAppPath)

  core.debug(`Moved Tectonic from ${appPath} to ${newAppPath}`)

  // make it executable
  fs.chmodSync(newAppPath, '750')

  return tectonicPath
}

const createTempFolder = async (pathToExecutable: string) => {
  const destFolder = path.join(path.dirname(pathToExecutable), uuid())
  await io.mkdirP(destFolder)
  return destFolder
}

export const setUpTectonic = async () => {
  try {
    const githubToken = core.getInput('github-token', {required: true})
    const version = core.getInput('tectonic-version')
    const biberVersion = core.getInput('biber-version')

    core.debug(`Finding releases for Tectonic version ${version}`)
    const release = await getTectonicRelease(githubToken, version)
    const platform = mapOS(os.platform())
    core.debug(
      `Getting build for Tectonic version ${release.version}: ${platform}`
    )
    core.debug(`Release: ${JSON.stringify(release)}`)
    const asset = release.getAsset(platform)
    if (!asset) {
      throw new Error(
        `Tectonic version ${version} not available for ${platform}`
      )
    }

    const tectonicPath = await downloadTectonic(asset.url)

    core.addPath(tectonicPath)

    if (biberVersion) {
      // optionally download biber
      core.debug(`Biber version: ${biberVersion}`)
      const biberPath = await downloadBiber(biberVersion)
      core.addPath(biberPath)
    }

    return release
  } catch (error: unknown) {
    if (error instanceof Error || typeof error === 'string') {
      core.error(error)
    }
    throw error
  }
}
