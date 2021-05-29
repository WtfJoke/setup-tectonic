import {getOctokit} from '@actions/github'

import {RELEASE_TAG_IDENTIFIER, TECTONIC, REPO_OWNER} from './constants'
import {valid} from 'semver'
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
    this.version = tagName.replace(RELEASE_TAG_IDENTIFIER, '')
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
) => {
  const octo = getOctokit(githubToken)
  const validVersion = valid(version)

  if (validVersion) {
    const {data: releaseData, status} = await octo.rest.repos.getReleaseByTag({
      owner: REPO_OWNER,
      repo: TECTONIC,
      tag: `${RELEASE_TAG_IDENTIFIER}${validVersion}`
    })
    if (status === 200) {
      const {id, tag_name, name, assets} = releaseData

      return new Release(id, tag_name, asReleaseAsset(assets), name)
    }
  }
  return await getLatestRelease(octo)
}

const getLatestRelease = async (octo: GithubOktokit) => {
  const releases = await octo.rest.repos.listReleases({
    owner: REPO_OWNER,
    repo: TECTONIC
  })
  const release = releases.data.find(currentRelease =>
    currentRelease.tag_name.startsWith(RELEASE_TAG_IDENTIFIER)
  )

  if (release) {
    return new Release(
      release.id,
      release.tag_name,
      asReleaseAsset(release.assets),
      release.name
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
