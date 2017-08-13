var path = require('path');

module.exports = {
  entry: './public/js/src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public', 'js', 'dist'),
  },
  watch: false,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            "presets": ["es2015", "react"],
            "env": {
              "development": {
                "plugins": ["transform-es2015-modules-amd"]
              },
              "production": {
                "plugins": ["transform-es2015-modules-amd"]
              },
              "test": {
                "plugins": []
              }
            }
          }
        }
      }
    ],
  },
  devtool: 'eval-source-map',
}
