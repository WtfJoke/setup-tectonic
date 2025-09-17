import { randomUUID } from "node:crypto";
import { chmodSync } from "node:fs";
import { platform as os_platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { addPath, debug, error, getInput } from "@actions/core";
import { mkdirP, mv } from "@actions/io";
import { downloadTool, extractTar, extractZip } from "@actions/tool-cache";
import { downloadBiber } from "./biber.js";
import { getTectonicRelease } from "./release.js";

const mapOS = (osKey: string) => {
  const mappings: Record<string, string> = {
    win32: "windows",
  };
  return mappings[osKey] ?? osKey;
};

const downloadTectonic = async (url: string) => {
  debug(`Downloading Tectonic from ${url}`);
  const archivePath = await downloadTool(url);

  debug("Extracting Tectonic");
  let tectonicPath: string;
  if (url.endsWith(".zip")) {
    tectonicPath = await extractZip(archivePath);
  } else if (url.endsWith(".tar.gz")) {
    tectonicPath = await extractTar(archivePath);
  } else if (url.endsWith(".AppImage")) {
    tectonicPath = await createPathForAppImage(archivePath);
  } else {
    throw new Error(`Unsupported archive format for tectonic: ${url}`);
  }
    debug(`Tectonic path is ${tectonicPath}`);

  return tectonicPath;
};

const createPathForAppImage = async (appPath: string) => {
  const tectonicPath = await createTempFolder(appPath);
  const newAppPath = resolve(tectonicPath, "tectonic");
  await mv(appPath, newAppPath);

  debug(`Moved Tectonic from ${appPath} to ${newAppPath}`);

  // make it executable
  chmodSync(newAppPath, "750");

  return tectonicPath;
};

const createTempFolder = async (pathToExecutable: string) => {
  const destFolder = join(dirname(pathToExecutable), randomUUID());
  await mkdirP(destFolder);
  return destFolder;
};

export const setUpTectonic = async () => {
  try {
    const githubToken = getInput("github-token", { required: true });
    const version = getInput("tectonic-version");
    const biberVersion = getInput("biber-version");

    debug(`Finding releases for Tectonic version ${version}`);
    const release = await getTectonicRelease(githubToken, version);
    const platform = mapOS(os_platform());
    debug(`Getting build for Tectonic version ${release.version}: ${platform}`);
    debug(`Release: ${JSON.stringify(release)}`);
    const asset = release.getAsset(platform);
    if (!asset) {
      throw new Error(
        `Tectonic version ${version} not available for ${platform}`,
      );
    }

    const tectonicPath = await downloadTectonic(asset.url);

    addPath(tectonicPath);

    if (biberVersion) {
      // optionally download biber
      debug(`Biber version: ${biberVersion}`);
      const biberPath = await downloadBiber(biberVersion);
      addPath(biberPath);
    }

    return release;
  } catch (exception: unknown) {
    if (exception instanceof Error || typeof exception === "string") {
      error(exception);
    }
    throw exception;
  }
};
