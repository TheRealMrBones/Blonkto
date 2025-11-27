import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

export default {
    entry: {
        game: './src/client/index.ts',
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
        plugins: [new TsconfigPathsPlugin({
            configFile: "./tsconfig.json",
            extensions: [".ts", ".tsx", ".js"],
        })],
        alias: {
            client: path.resolve(process.cwd(), "src/client"),
            configs: path.resolve(process.cwd(), "src/configs"),
            game: path.resolve(process.cwd(), "src/game"),
            server: path.resolve(process.cwd(), "src/server"),
            shared: path.resolve(process.cwd(), "src/shared"),
        },
        extensions: ['.ts', '.js', '.css'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
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
