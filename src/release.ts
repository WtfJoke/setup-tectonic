import { debug } from "@actions/core";
import { getOctokit } from "@actions/github";
import { coerce, type SemVer, valid } from "semver";
import { RELEASE_TAG_IDENTIFIER, REPO_OWNER, TECTONIC } from "./constants.js";
import type { GithubOktokit, GithubReleaseAssets } from "./github-types.js";

export interface ReleaseAsset {
  name: string;
  url: string;
}

export class Release {
  id: number;
  name: string | null;
  version: string;
  semVerVersion: SemVer | null;
  tagName: string;
  assets: ReleaseAsset[];

  constructor(
    id: number,
    tagName: string,
    assets: ReleaseAsset[],
    name: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.version = tagName.replace(RELEASE_TAG_IDENTIFIER, "");
    this.semVerVersion = coerce(this.version);
    this.tagName = tagName;
    this.assets = assets;
  }

  getAsset(platform: string): ReleaseAsset | undefined {
    const versionPrefix = `tectonic-${this.version}-x86_64`;
    const favourLinuxAppImage =
      this.semVerVersion != null && this.semVerVersion.minor <= 10;
    const platformFileNames: Record<string, string> = {
      windows: `${versionPrefix}-pc-${platform}-msvc.zip`,
      darwin: `${versionPrefix}-apple-${platform}.tar.gz`,
      linux: favourLinuxAppImage
        ? `${versionPrefix}.AppImage`
        : `${versionPrefix}-unknown-linux-gnu.tar.gz`,
    };
    const fileName = platformFileNames[platform];
    return this.assets.find((ghAsset) => ghAsset.name === fileName);
  }
}

export const getTectonicRelease = async (
  githubToken: string,
  version?: string,
) => {
  const octo = getOctokit(githubToken);
  const validVersion = valid(version);

  if (validVersion) {
    const { data: releaseData } = await octo.rest.repos.getReleaseByTag({
      owner: REPO_OWNER,
      repo: TECTONIC,
      tag: `${RELEASE_TAG_IDENTIFIER}${validVersion}`,
    });

    const { id, tag_name, name, assets } = releaseData;

    return new Release(id, tag_name, asReleaseAsset(assets), name);
  }
  return getLatestRelease(octo);
};

const getLatestRelease = async (octo: GithubOktokit) => {
  debug("Fetching latest release from GitHub");
  const { data: latestRelease } = await octo.rest.repos.getLatestRelease({
    owner: REPO_OWNER,
    repo: TECTONIC,
  });

  debug(`Latest release tag: ${latestRelease.tag_name}`);
  if (latestRelease.tag_name.startsWith(RELEASE_TAG_IDENTIFIER)) {
    debug("Latest release is a tectonic release, returning it");
    return new Release(
      latestRelease.id,
      latestRelease.tag_name,
      asReleaseAsset(latestRelease.assets),
      latestRelease.name,
    );
  }

  debug("Latest release is a component, falling back to paginated search");
  const releases = await octo.paginate(
    octo.rest.repos.listReleases,
    { owner: REPO_OWNER, repo: TECTONIC, per_page: 100 },
    (response, done) => {
      const found = response.data.find((r) =>
        r.tag_name.startsWith(RELEASE_TAG_IDENTIFIER),
      );
      if (found) {
        done();
        return [found];
      }
      return [];
    },
  );

  const release = releases[0];
  if (release) {
    debug(`Found tectonic release: ${release.tag_name}`);
    return new Release(
      release.id,
      release.tag_name,
      asReleaseAsset(release.assets),
      release.name,
    );
  }

  throw new Error("Could not get latest tectonic release");
};

const asReleaseAsset = (
  assets: readonly Pick<
    GithubReleaseAssets[number],
    "name" | "browser_download_url"
  >[],
): ReleaseAsset[] => {
  return assets.map((ghAsset) => ({
    name: ghAsset.name,
    url: ghAsset.browser_download_url,
  }));
};
