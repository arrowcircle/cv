const esbuild = require("esbuild");
const autoprefixer = require("autoprefixer");
const postCssPlugin = require("@deanc/esbuild-plugin-postcss");
const tailwindcss = require("tailwindcss");
const assets_manifest_from = require("./assets.js");
const fs = require('fs-extra')
const glob = require("glob");
let assetsDict = {};

function assetUrl(filename) {
  return assetsDict[filename];
}

let esbuildConfig = {
  entryPoints: ['src/javascripts/application.js'],
  bundle: true,
  outdir: "build/assets",
  metafile: true,
  minify: process.env.ELEVENTY_ENV === "production",
  sourcemap: process.env.ELEVENTY_ENV !== "production",
  plugins: [
    postCssPlugin({
      plugins: [
        tailwindcss,
        autoprefixer]
    }),
  ],
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.gif': 'file',
    '.eot': 'file',
    '.ttf': 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.jpg': 'file'
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./src/javascripts/**/*");
  eleventyConfig.addWatchTarget("./src/stylesheets/**/*");

  eleventyConfig.addPassthroughCopy({
    "src/images": "assets",
    "src/robots.txt": ""
  });

  // export assets manifest
  eleventyConfig.addShortcode("assetUrl", assetUrl);

  // esbuild
  eleventyConfig.on("beforeBuild", async () => {
    if (process.env.ELEVENTY_ENV === "production") {
      esbuildConfig.entryNames = "[name].[hash]";
      // cleanup assets dir
      glob
        .sync("build/assets/**/*.{js,css,js.map,css.map}")
        .forEach(function (file) {
          fs.rm(file);
        });
    }

    let result = await esbuild.build(esbuildConfig).catch(() => process.exit(1))
    assetsDict = assets_manifest_from(result.metafile);
    return result;
  });

  return {
    dir: {
      input: "src/",
      output: "build",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",

    // 1.1 Enable eleventy to pass dirs specified above
    passthroughFileCopy: true
  };
};