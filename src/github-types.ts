import type {Endpoints} from '@octokit/types'
import {GitHub} from '@actions/github/lib/utils'

export type GithubReleaseAssets =
  Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response']['data']['assets']
export type GithubOktokit = InstanceType<typeof GitHub>
