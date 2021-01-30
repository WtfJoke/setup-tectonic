<p align="left">
  <a href="https://github.com/actions/typescript-action/actions">
    <img alt="CI" src="https://github.com/WtfJoke/setup-tectonic/workflows/CI/badge.svg">
  </a>
</p>

The `wtfjoke/setup-tectonic` action is a JavaScript action that sets up Tectonic in your GitHub Actions workflow by:

- Downloading a requested version of Tectonic and adding it to the `PATH`.
- (Optionally) downloading a requested version of Biber and adding it to the `PATH`.

# Usage

This action can be run on `ubuntu-20.04` (not on `ubuntu-latest` / `ubuntu-18.04`), `windows-latest`, and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Tectonic. The `GITHUB_TOKEN` is needed to query the Github Releases of `tectonic-typesetting/tectonic` to download tectonic.

You can even use caching (see example below) to speed up your workflow :tada:.

See [action.yml](https://github.com/WtfJoke/setup-tectonic/blob/main/action.yml) for a full description of all parameters.

```yml
steps:
- uses: wtfjoke/setup-tectonic@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
- run: tectonic main.tex
```
You can also download a specific version of Tectonic
```yml
steps:
- uses: wtfjoke/setup-tectonic@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    tectonic-version: 0.4.0
- run: tectonic main.tex
```

If you want to use biber, specify a biber version (for a full example see [below](https://github.com/WtfJoke/setup-tectonic#with-biber))
```yml
steps:
- uses: wtfjoke/setup-tectonic@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    biber-version: 2.15
- run: biber --version
```

## Upload pdf (using `actions/upload-artifact`)
```yml
name: 'Build LaTex Document'
on: 
  push:
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

## With enabled cache (using `actions/cache`)
```yml
name: 'Build LaTex Document'
on: 
  push:
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

## With biber
```yml
name: 'Build LaTex Document with Biber'
on: 
  push:
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
          biber-version: "latest"
      - name: Run Tectonic + Biber
        run: |
          tectonic --keep-intermediates --reruns 0 main.tex
          biber main
          tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v2
        with:
          name: main
          path: main.pdf
```

## Comparison to other LaTeX/Tectonic actions like [vinay0410/tectonic-action](https://github.com/vinay0410/tectonic-action)


This action was created because all existing Github Actions for compiling LaTeX documents I came accross are docker based actions, which are [slower than Javascript based actions](https://docs.github.com/en/actions/creating-actions/about-actions#docker-container-actions).

LaTex Docker images tend to be huge (2gb+). Tectonic images are an exception but they need to be maintained and updated with new Tectonic versions. This is not often the case, at the time of writing [my docker image](https://github.com/WtfJoke/tectonic-docker) is the only one up to date with the latest tectonic version.

In comparsion this github action doesnt need an update if a new release of tectonic is released, it just works.

The existing github actions doesnt support biber (notable exception: [birjolaxew/tectonic-biber-action](https://github.com/birjolaxew/tectonic-biber-action)).

Additionaly most of the github actions tend to do too much or are too strict. 

This github action has one job, to setup tectonic (and optionally biber). You can choose on your own how you want to call tectonic, how and if you want to cache your dependencies, how and if you want to upload your pdf. Depending on your decisions you can choose the best action to do the corresponding job (eg. [actions/cache](https://github.com/actions/cache) for caching, [actions/upload-artifact](https://github.com/actions/upload-artifact) or [actions/create-release](https://github.com/actions/create-release) for publihsing your pdf)
