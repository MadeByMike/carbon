module.exports = {
  entry: './lib/reveal.js',
  output: {
    filename: './dist/carbon.now.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
      //   {
      //     test: /\.html$/,
      //     use: ['html-loader']
      //   }
    ]
  }
}
