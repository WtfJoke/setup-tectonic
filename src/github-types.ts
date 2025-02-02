import type {Endpoints} from '@octokit/types'
import type {getOctokit} from '@actions/github'

export type GithubReleaseAssets =
  Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response']['data']['assets']
export type GithubOktokit = ReturnType<typeof getOctokit>
