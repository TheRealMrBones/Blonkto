import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        game: './src/client/index.js',
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(path.resolve(), 'dist/webpack'),
        clean: true,
    },
    module: {
        rules: [
        {
            test: /\.(js|ts)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        [
                            '@babel/preset-typescript',
                            {
                                configFile: 'tsconfig.webpack.json'
                            }
                        ]
                    ]
                },
            },
        },
        {
            test: /\.css$/,
            use: [
            {
                loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            ],
        },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.css'],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/client/index.html',
        }),
    ],
};