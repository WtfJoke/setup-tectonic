[![CI](https://github.com/WtfJoke/setup-tectonic/actions/workflows/test.yml/badge.svg)](https://github.com/WtfJoke/setup-tectonic/actions/workflows/test.yml)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=security_rating)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=bugs)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=code_smells)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=sqale_index)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=WtfJoke_setup-tectonic&metric=ncloc)](https://sonarcloud.io/dashboard?id=WtfJoke_setup-tectonic)

The `wtfjoke/setup-tectonic` action is a JavaScript action that sets up [Tectonic](https://github.com/tectonic-typesetting/tectonic) in your GitHub Actions workflow by:

- Downloading a requested version of Tectonic and adding it to the `PATH`.
- (Optionally) downloading a requested version of [Biber](https://sourceforge.net/projects/biblatex-biber/) and adding it to the `PATH`.

# :wrench: Usage

This action can be run on `ubuntu-latest`, `windows-latest`, and `macos-latest` GitHub Actions runners.

The default configuration installs the latest version of Tectonic. The `GITHUB_TOKEN` is needed to query the Github Releases of `tectonic-typesetting/tectonic` to download tectonic.

You can even use caching (see example below) to speed up your workflow :tada:.

See [action.yml](https://github.com/WtfJoke/setup-tectonic/blob/main/action.yml) for a full description of all parameters.

```yml
steps:
- uses: wtfjoke/setup-tectonic@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
- run: tectonic main.tex
```
You can also download a specific version of Tectonic
```yml
steps:
- uses: wtfjoke/setup-tectonic@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    tectonic-version: 0.7.1
- run: tectonic main.tex
```

If you want to use biber, specify a biber version (for a full example see [below](https://github.com/WtfJoke/setup-tectonic#with-biber))
```yml
steps:
- uses: wtfjoke/setup-tectonic@v2
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
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: wtfjoke/setup-tectonic@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Run Tectonic
        run: tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v3
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
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: actions/cache@v3
        name: Tectonic Cache
        with:
          path: ~/.cache/Tectonic
          key: ${{ runner.os }}-tectonic-${{ hashFiles('**/*.tex') }}
          restore-keys: |
           ${{ runner.os }}-tectonic-
      - uses: wtfjoke/setup-tectonic@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Run Tectonic
        run: tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v3
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
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - uses: actions/cache@v3
        name: Tectonic Cache
        with:
          path: ~/.cache/Tectonic
          key: ${{ runner.os }}-tectonic-${{ hashFiles('**/*.tex') }}
          restore-keys: |
           ${{ runner.os }}-tectonic-
      - uses: wtfjoke/setup-tectonic@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          biber-version: "latest"
      - name: Run Tectonic + Biber
        run: tectonic main.tex
      - name: Upload pdf
        uses: actions/upload-artifact@v3
        with:
          name: main
          path: main.pdf
```

**Note**: Tectonic has added biber support in `0.7.1` (see [changelog](https://github.com/tectonic-typesetting/tectonic/releases/tag/tectonic%400.7.1)). Prior to that version you need to run following commands:
```yml
run: |
  tectonic --keep-intermediates --reruns 0 main.tex
  biber main
  tectonic main.tex
```

# 📊 Comparison to other LaTeX/Tectonic actions like [vinay0410/tectonic-action](https://github.com/vinay0410/tectonic-action)

| Pro                       | Description                                                               |
| --------------------------|:--------------------------------------------------------------------------------------------|
| :zap: Performance         | - Supports caching </br> - Native Javascript Action's are faster than docker (:whale:) based actions  |
| :robot:  Future proofed   | New tectonic versions right on release without code changes                                 |
| :art: Customizability     | Do one thing and do it well - let other actions do what they can do best                    | 
</br>

## Explanation
This action was created because all existing Github Actions for compiling LaTeX documents I came across are docker based actions, which are [slower than Javascript based actions](https://docs.github.com/en/actions/creating-actions/about-actions#docker-container-actions).

LaTex Docker images tend to be huge (2gb+). Tectonic images are an exception but they need to be maintained and updated with new Tectonic versions. This is not often the case, at the time of writing [my docker image](https://github.com/WtfJoke/tectonic-docker) is the only one up to date with the latest tectonic version.

In comparsion, this github action doesnt need an update if a new release of tectonic is released, it just works.

The existing github actions doesnt support biber (notable exception: [birjolaxew/tectonic-biber-action](https://github.com/birjolaxew/tectonic-biber-action)).

Additionaly most of the github actions tend to do too much or are too strict. 

This github action has one job, to setup tectonic (and optionally biber). You can choose on your own how you want to call tectonic, how and if you want to cache your dependencies, how and if you want to upload your pdf. Depending on your decisions you can choose the best action to do the corresponding job (eg. [actions/cache](https://github.com/actions/cache) for caching, [actions/upload-artifact](https://github.com/actions/upload-artifact) or [actions/create-release](https://github.com/actions/create-release) for publishing your pdf)


# 🤓 How does the cache works?
The official cache action [actions/cache](https://github.com/actions/cache) has three parameters:
- `path` - A list of files, directories, and wildcard patterns to cache and restore. 
- `key` - Primary cache key - If the key has a cache-hit, it means the cache is up to date. The execution of a tool shouldnt change the cache anymore.
- `restore-keys` - If there is no key hit with `key` - These will be used to restore the cache. The execution of a tool most likely will change the cache.  
  
## Path
For tectonic the cache directories (`path`) are as follows (see also [tectonic-typesetting/tectonic#159](https://github.com/tectonic-typesetting/tectonic/issues/159)):

| OS      | Cache-Directory | Run-Command to export it as environment variable
| ----------- | ----------------------------- | --------------------------------------------|
| Linux      | `~/.cache/Tectonic`       | `echo TECTONIC_CACHE_PATH=~/.cache/Tectonic >> $GITHUB_ENV`
| Mac   | `~/Library/Caches/Tectonic`        | `echo TECTONIC_CACHE_PATH=~/Library/Caches/Tectonic >> $GITHUB_ENV`
| Windows   | `%LOCALAPPDATA%\TectonicProject\Tectonic` | <code>echo TECTONIC_CACHE_PATH=$env:LOCALAPPDATA\TectonicProject\Tectonic | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append`</code>

## Key
By calculate the hash all .tex files (see `hashFiles('**/*.tex')`) and integrate that into the cache-`key` we can make sure, that another execution of tectonic wont change the result. 

Simpler put, as long as no `.tex` files are changing, the cache wont change.

## Restore-Keys
We change our `.tex` files but still want to use a cache? `restore-keys` to the rescue :muscle:
</br>

When we change our .tex files (either by using a new package or just change the text), the exact cache `key` wont hit. Still we want to use the cache from the previous runs, as we most likely still use the same packages. So `restore keys` will use the cache from the previous run and then (at the end of the job execution) will update the existing cache with `key`. 

</br>
Thats how the cache works :)

