const postcss = require('rollup-plugin-postcss');




module.exports = {
    rollup(config, options) {
      // config.name = "lbi"
      console.log(config)
      // config.output = 
      config.plugins.push(
        postcss({
          inject: true,
          extract: !!options.writeMeta,
          extensions: [".less", ".css"]
        }),
      );
      return config;
    },
  };