# Webview semver calculator - develop and debug view logic using Typescript and Node

Demonstrates VS Code's [webview API](https://code.visualstudio.com/api/extension-guides/webview)
with a typescript and node based view logic. This is useful for those that implement more complex Webviews.
The more code you add to tye Webview view logic, the more you benefit from the full power of the Typescript syntactic checking.
Moreover, once the Webview view logic is built using NPM, it is easy to include any of the Node packages e.g.
data visualization packages. The structure of the sample also enables debugging of the Webview view logic.

This sample demonstrates includes:

- Creating and showing a basic webview.
- Using an NPM package in the webview view logic.
- Simpler authoring of the HTML and CSS styles and quick preview.
- Faster turn around view logic testing workflow using the [Debugger for Chrome extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

## Demo

![demo](demo.gif)

The webview view logic takes advantage of full syntactic validation, because it is written in Typescript.
This way you can also use your favorite Node modules inside the webview. The sample shows that using the `semver` module.

## VS Code API

### `vscode` module

- [`window.createWebviewPanel`](https://code.visualstudio.com/api/references/vscode-api#window.createWebviewPanel)

## Running the example

### Running in VS Code

- Open this example in VS Code 1.47+
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging using the _Run Extension_ launch configuration

Run the `Webview semver calculator: Start Webview semver calculator session` to create the webview.

### Debugging view logic in Chrome

It is also possible to launch and debug just the HTML+CSS+JS part of the Webview (without having to start VS Code):

- `npm run watch` in the `webview` directory (also conveniently configured in `tasks.json`)
- select `F5` to start debugging using the _Preview view.html_
- set breakpoints either in the Chrome debugger, or into the `viewLogic.js` in VS Code

## Developing your own webview from this sample

The webview HTML content is on purpose saved into `view.html` file as a template, so the file may be open in a web browser
or any HTML editor for quick and convenient evolution. It is placed into the `webview/out` folder, where Browserify outputs
the transpiled view logic into a Javascript file `viewLogic.js`. Therefore it is necessary to run `npm run compile`
in the `webview` folder (or on the top folder) before the `view.html` works. To keep the generated Javascript up to date with your
Typescript changes in `viewLogic.ts`, keep the `npm run watch` task form the `webview/package.json` running.

Read more about the [browserify, watchify and tsify](https://www.npmjs.com/package/tsify#watchify).

Furthermore, minification and uglyfication plugins may be added to the `webview/package.json` to create smaller extension packages
and faster Webview start-up times.

Last, but not least, with NPM used to transpile the view logic, you are one step closer to creating unit test coverage
and including it into your extensions `npm test`.
