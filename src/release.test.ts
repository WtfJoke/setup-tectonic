import { debug } from "@actions/core";
import { getOctokit } from "@actions/github";
import { vi } from "vitest";
import { getTectonicRelease, Release, type ReleaseAsset } from "./release.js";

vi.mock("@actions/core", () => ({
  debug: vi.fn(),
}));

vi.mock("@actions/github", () => ({
  getOctokit: vi.fn(),
}));

describe("release", () => {
  const tectonic012Assets: ReleaseAsset[] = [
    {
      name: "tectonic-0.12.0-aarch64-apple-darwin.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-aarch64-apple-darwin.tar.gz",
    },
    {
      name: "tectonic-0.12.0-arm-unknown-linux-musleabihf.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-arm-unknown-linux-musleabihf.tar.gz",
    },
    {
      name: "tectonic-0.12.0-i686-unknown-linux-gnu.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-i686-unknown-linux-gnu.tar.gz",
    },
    {
      name: "tectonic-0.12.0-mips-unknown-linux-gnu.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-mips-unknown-linux-gnu.tar.gz",
    },
    {
      name: "tectonic-0.12.0-x86_64-apple-darwin.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-apple-darwin.tar.gz",
    },
    {
      name: "tectonic-0.12.0-x86_64-pc-windows-gnu.zip",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-gnu.zip",
    },
    {
      name: "tectonic-0.12.0-x86_64-pc-windows-msvc.zip",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-msvc.zip",
    },
    {
      name: "tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz",
    },
    {
      name: "tectonic-0.12.0-x86_64-unknown-linux-musl.tar.gz",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-musl.tar.gz",
    },
    {
      name: "tectonic-0.12.0-x86_64.AppImage",
      url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64.AppImage",
    },
  ];

  const tectonic012Release = new Release(
    81233082,
    "tectonic@0.12.0",
    tectonic012Assets,
    "tectonic 0.12.0",
  );

  describe("getAsset", () => {
    it("should return .zip filename on windows", () => {
      expect(tectonic012Release.getAsset("windows")).toStrictEqual({
        name: "tectonic-0.12.0-x86_64-pc-windows-msvc.zip",
        url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-pc-windows-msvc.zip",
      });
    });

    it("should return .tar.gz filename on linux", () => {
      expect(tectonic012Release.getAsset("linux")).toStrictEqual({
        name: "tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz",
        url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-unknown-linux-gnu.tar.gz",
      });
    });

    it("should return .tar.gz filename on mac", () => {
      expect(tectonic012Release.getAsset("darwin")).toStrictEqual({
        name: "tectonic-0.12.0-x86_64-apple-darwin.tar.gz",
        url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.12.0/tectonic-0.12.0-x86_64-apple-darwin.tar.gz",
      });
    });

    it("should return .AppImage filename on linux releases up to 0.10.0", () => {
      const fakeTectonic010Assets = tectonic012Assets.map((asset) => ({
        name: asset.name.replace(/0.12.0/g, "0.10.0"),
        url: asset.url.replace(/0.12.0/g, "0.10.0"),
      }));
      const tectonic010Release = new Release(
        81233083,
        "tectonic@0.10.0",
        fakeTectonic010Assets,
        "tectonic 0.10.0",
      );
      expect(tectonic010Release.getAsset("linux")).toStrictEqual({
        name: "tectonic-0.10.0-x86_64.AppImage",
        url: "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.10.0/tectonic-0.10.0-x86_64.AppImage",
      });
    });
  });

  describe("getLatestRelease", () => {
    const mockTectonicRelease = {
      id: 12345,
      tag_name: "tectonic@0.15.0",
      name: "tectonic 0.15.0",
      assets: [
        {
          name: "tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz",
          browser_download_url: "https://example.com/tectonic.tar.gz",
        },
      ],
    };

    const mockComponentRelease = {
      id: 99999,
      tag_name: "tectonic_xetex_layout@0.1.0",
      name: "tectonic_xetex_layout 0.1.0",
      assets: [],
    };

    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should use fast path when latest release is a tectonic@ release", async () => {
      const mockGetLatestRelease = vi.fn().mockResolvedValue({
        data: mockTectonicRelease,
      });
      const mockPaginate = vi.fn();

      vi.mocked(getOctokit).mockReturnValue({
        rest: {
          repos: {
            getLatestRelease: mockGetLatestRelease,
          },
        },
        paginate: mockPaginate,
      } as unknown as ReturnType<typeof getOctokit>);

      const release = await getTectonicRelease("fake-token");

      expect(mockGetLatestRelease).toHaveBeenCalledOnce();
      expect(mockPaginate).not.toHaveBeenCalled();
      expect(release.tagName).toBe("tectonic@0.15.0");
      expect(release.version).toBe("0.15.0");
      expect(debug).toHaveBeenCalledWith(
        "Latest release is a tectonic release, returning it",
      );
    });

    it("should fall back to pagination when latest release is a component", async () => {
      const mockGetLatestRelease = vi.fn().mockResolvedValue({
        data: mockComponentRelease,
      });
      const mockPaginate = vi.fn().mockResolvedValue([mockTectonicRelease]);

      vi.mocked(getOctokit).mockReturnValue({
        rest: {
          repos: {
            getLatestRelease: mockGetLatestRelease,
            listReleases: vi.fn(),
          },
        },
        paginate: mockPaginate,
      } as unknown as ReturnType<typeof getOctokit>);

      const release = await getTectonicRelease("fake-token");

      expect(mockGetLatestRelease).toHaveBeenCalledOnce();
      expect(mockPaginate).toHaveBeenCalledOnce();
      expect(release.tagName).toBe("tectonic@0.15.0");
      expect(release.version).toBe("0.15.0");
      expect(debug).toHaveBeenCalledWith(
        "Latest release is a component, falling back to paginated search",
      );
      expect(debug).toHaveBeenCalledWith(
        "Found tectonic release: tectonic@0.15.0",
      );
    });

    it("should throw error when no tectonic release is found", async () => {
      const mockGetLatestRelease = vi.fn().mockResolvedValue({
        data: mockComponentRelease,
      });
      const mockPaginate = vi.fn().mockResolvedValue([]);

      vi.mocked(getOctokit).mockReturnValue({
        rest: {
          repos: {
            getLatestRelease: mockGetLatestRelease,
            listReleases: vi.fn(),
          },
        },
        paginate: mockPaginate,
      } as unknown as ReturnType<typeof getOctokit>);

      await expect(getTectonicRelease("fake-token")).rejects.toThrow(
        "Could not get latest tectonic release",
      );
    });
  });
});
