import {getOctokit} from '@actions/github'

import * as constants from './constants'
import {GithubReleaseAssets, GithubOktokit} from './githubTypes'

interface ReleaseAsset {
  name: string
  url: string
}

export class Release {
  id: number
  name: string | null
  version: string
  tagName: string
  assets: ReleaseAsset[]

  constructor(
    id: number,
    tagName: string,
    assets: ReleaseAsset[],
    name: string | null
  ) {
    this.id = id
    this.name = name
    this.version = tagName.replace(constants.RELEASE_TAG_IDENTIFIER, '')
    this.tagName = tagName
    this.assets = assets
  }

  getAsset(platform: string): ReleaseAsset | undefined {
    const versionPrefix = `tectonic-${this.version}-x86_64`
    const platformFileNames: Record<string, string> = {
      windows: `${versionPrefix}-pc-${platform}-msvc.zip`,
      darwin: `${versionPrefix}-apple-${platform}.tar.gz`,
      linux: `${versionPrefix}.AppImage`
    }
    const fileName = platformFileNames[platform]
    return this.assets.find(ghAsset => ghAsset.name === fileName)
  }
}

export const getTectonicRelease = async (
  githubToken: string,
  version?: string
): Promise<Release> => {
  const octo = getOctokit(githubToken)

  if (version && version !== 'latest') {
    const releaseResult = await octo.repos.getReleaseByTag({
      owner: constants.REPO_OWNER,
      repo: constants.TECTONIC,
      tag: constants.RELEASE_TAG_IDENTIFIER + version
    })
    if (releaseResult.status === 200) {
      const {id, tag_name, name, assets} = releaseResult.data

      return new Release(id, tag_name, asReleaseAsset(assets), name)
    }
  }
  return await getLatestRelease(octo)
}

const getLatestRelease = async (octo: GithubOktokit): Promise<Release> => {
  const releasesResult = await octo.repos.listReleases({
    owner: constants.REPO_OWNER,
    repo: constants.TECTONIC
  })
  const releaseData = releasesResult.data.find(release =>
    release.tag_name.startsWith(constants.RELEASE_TAG_IDENTIFIER)
  )

  if (releaseData) {
    return new Release(
      releaseData.id,
      releaseData.tag_name,
      asReleaseAsset(releaseData.assets),
      releaseData.name
    )
  } else {
    throw new Error('Couldnt get latest tectonic release')
  }
}

const asReleaseAsset = (assets: GithubReleaseAssets): ReleaseAsset[] => {
  return assets.map(ghAsset => ({
    name: ghAsset.name,
    url: ghAsset.browser_download_url
  }))
}
