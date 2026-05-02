[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)
**[DEPRECATED]** Please use https://github.com/greenflute/tiny-grid-viewer

# yaml-grid-viewer
Inspired and cloned from dutchigor:json-grid-viewer, this extension allows you get a better overview of the content in a YAML file by showing it in a resizable grid.
- Columns are resizable.
- Each object and array is collapsed by default but can be expanded to see all contents
- Arrays of objects show in a table format

## Demo
![demo](./demo.png)

## Usage
To open a yaml file in the grid viewer, right click the file, select *Open With... > YAML Grid*. The grid is read only but will display any changes made to the yaml file live, provided the yaml is valid.

## To do:
- Add editing capabilities
- Take colours from the active theme

## Build Extension
```
npm install
npm run build
npm run vscode:prepublish
vsce package
```

## Download VSIX from GitHub
This repository includes a GitHub Actions workflow that builds a `.vsix` package automatically.

### From a GitHub Release
When a version tag such as `v0.1.3` is pushed, the workflow creates or updates the matching GitHub Release and attaches the generated `.vsix` file to the Release assets.
1. Open the repository's **Releases** page.
2. Open the target release.
3. Download the attached `.vsix` file from **Assets**.

## Release Process
To publish a new GitHub Release with a downloadable VSIX:
1. Update the version in `package.json` and `package-lock.json`.
2. Commit and push the version change to GitHub.
3. Create and push a version tag such as `v0.1.3`.
4. Wait for the **Build VSIX** workflow to finish; it will create or update the GitHub Release automatically.
5. Download the `.vsix` file from the Release **Assets** section.

## Note:
- as of Node 20.5.1, consider "export NODE_OPTIONS=--openssl-legacy-provider" before run "npm build", to avoid "Error: error:0308010C:digital envelope routines::unsupported".
- watchout .vscodeignore and use "vsce ls" to check files that will be included in the final package.
