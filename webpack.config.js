const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "events": require.resolve("events/"),
    }
  },
  output: {
    filename: 'mcp-client.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'MCPClient',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
};

