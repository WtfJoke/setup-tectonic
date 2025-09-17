import type { getOctokit } from "@actions/github";
import type { Endpoints } from "@octokit/types";

export type GithubReleaseAssets =
  Endpoints["GET /repos/{owner}/{repo}/releases/{release_id}"]["response"]["data"]["assets"];
export type GithubOktokit = ReturnType<typeof getOctokit>;
