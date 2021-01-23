import * as core from '@actions/core'
import * as os from 'os'
import * as tc from '@actions/tool-cache'
import {getTectonicRelease, Release} from './release'

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(osKey: string): string {
  const mappings: {[key: string]: string} = {
    win32: 'windows'
  }
  return mappings[osKey] || osKey
}

async function downloadTectonic(url: string): Promise<string> {
  core.debug(`Downloading Tectonic from ${url}`)
  const zipPath = await tc.downloadTool(url)

  core.debug('Extracting Tectonic zip file')
  const tectonicPath = await tc.extractZip(zipPath)
  core.debug(`Tectonic path is ${tectonicPath}.`)

  if (!zipPath || !tectonicPath) {
    throw new Error(`Unable to download tectonic from ${url}`)
  }

  return tectonicPath
}

export async function setUpTectonic(): Promise<Release> {
  try {
    const githubToken = core.getInput('github-token')
    const version = core.getInput('tectonic_version')
    // const useBiber = core.getInput('setup_biber') === 'true'

    core.debug(`Finding releases for Tectonic version ${version}`)
    const release = await getTectonicRelease(githubToken, version)
    const platform = mapOS(os.platform())
    core.debug(
      `Getting build for Tectonic version ${release.version}: ${platform}`
    )
    core.info(`Release: ${JSON.stringify(release)}`)
    const asset = release.getAsset(platform)
    if (!asset) {
      throw new Error(
        `Tectonic version ${version} not available for ${platform}`
      )
    }

    const tectonicPath = await downloadTectonic(asset.url)

    core.addPath(tectonicPath)

    return release
  } catch (error) {
    core.error(error)
    throw error
  }
}
