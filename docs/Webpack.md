# Using FluexGL DSP in your Webpack project

FluexGL DSP can easily be integrated into your Webpack project, as long as it’s configured correctly.
FluexGL DSP uses dynamic imports and doesn’t just load JavaScript files — it also imports so-called worklet files, which are essentially JavaScript files read as plain text.

By following the methods below, you can easily set up your Webpack project.

## ``webpack.config.js``

Webpack 5 or higher is required to use the following module rules.
If you’re using Webpack 4 or lower, you can use raw-loader instead.

Webpack will include the associated WebAssembly file in the build process and place it in the configured output directory. Ensure the WebAssembly filename is static, because you must provide the file’s path when initializing the library with ``InitializeDspPipeline()`` function.

The name of the file is normally ``fluex_dsp_bg.wasm``.

```json
{
    test: /\.worklet$/,
    type: "asset/source"
},
```

```js
{
    test: /\.wasm$/,
    type: "asset/resource",
    generator: {
        filename: "[name][ext]"
    }
}
```

This rule will make Webpack read the associated .worklet files as text files.

## Declaration in entry file

You must declare the usage of worklet files in the entry script where you use FluexGL DSP.
Otherwise, Webpack will treat them as JavaScript modules instead of plain text files.

This can be done in any TypeScript file, as long as both Webpack and your ``tsconfig.json`` file understand what a .worklet file is.

```ts
declare module "*.worklet" {
    const content: string;
    export default content;
}
```