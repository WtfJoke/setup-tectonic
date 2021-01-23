<p align="left">
  <a href="https://github.com/actions/typescript-action/actions">
    <img alt="CI" src="https://github.com/WtfJoke/setup-tectonic/workflows/CI/badge.svg">
  </a>
</p>

The `wtfjoke/setup-tectonic` action is a JavaScript action that sets up Tectonic in your GitHub Actions workflow by:

- Downloading a requested version of Tectonic and adding it to the `PATH`.

# Usage

This action can be run on `ubuntu-20.04` (not on `ubuntu-latest` / `ubuntu-18.04`), `windows-latest`, and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Tectonic. The `GITHUB_TOKEN` is needed to query the Github Releases of `tectonic-typesetting/tectonic` to download tectonic.

You can even use caching (see example below) to speed up your workflow :tada:.

```yml
steps:
- uses: wtfjoke/setup-tectonic@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
- run: tectonic --version
```
You can also download a specific version of Tectonic
```yml
steps:
- uses: wtfjoke/setup-tectonic@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    tectonic-version: 0.4.0
- run: tectonic --version
```

## Upload pdf (using `actions/upload-artifact`)
```yml
jobs:
  build:
    runs-on: ubuntu-20.04

    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - uses: wtfjoke/setup-tectonic@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Run Tectonic
        run: tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v2
        with:
          name: main
          path: main.pdf
```

## With enabled cache
```yml
jobs:
  build:
    runs-on: ubuntu-20.04

    steps:
      - name: Export Tectonic cache path
        run: echo TECTONIC_CACHE_PATH=$HOME/.cache/Tectonic >> $GITHUB_ENV
      - name: Checkout
        uses: actions/checkout@v2
      - uses: actions/cache@v2
        name: Tectonic Cache
        with:
          path: ${{ env.TECTONIC_CACHE_PATH }}
          key: ${{ runner.os }}-tectonic-${{ hashFiles('**/*.tex') }}
          restore-keys: |
           ${{ runner.os }}-tectonic-
      - uses: wtfjoke/setup-tectonic@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Run Tectonic
        run: tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v2
        with:
          name: main
          path: main.pdf
```