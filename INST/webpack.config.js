import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import Dotenv from 'dotenv-webpack';

////////////



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production';

export default {
  mode: isDev ? 'development' : 'production',

  entry: './src/index.tsx',


  output: {
    path: path.resolve(__dirname, 'dist'),
    // Замени bundle.js на этот шаблон:
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Путь к твоему шаблону
      title: 'Мой Webpack проект'    // Тот самый заголовок
    }),
    new MiniCssExtractPlugin({
            filename: 'assets/styles/[name].[contenthash].css' // Имя и путь для CSS файла
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      // Поменяй .json на .cjs здесь:
      overrideConfigFile: path.resolve(__dirname, '.eslintrc.cjs'), 
      context: path.resolve(__dirname, 'src'),
    }),
       new Dotenv({
      path: './.env', // Путь к файлу (по умолчанию он и так такой)
      safe: true,     // Можно создать .env.example, чтобы проверять наличие всех переменных
      systemvars: true // Позволяет считывать переменные из самой ОС (полезно для CI/CD)
    }),
  ],

  /////////////////////
  module: {
    rules: [

      ////// babel/react 
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript', // Babel просто "отрезает" типы
            ],
          },
        },
      },

      ////// css 
       {
        test: /\.(s[ac]ss|css)$/i,
        use: [
          // В dev-режиме вставляем стили в <style>, в prod — выносим в .css файл для скорости
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,                            
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: [['autoprefixer', {}]] },
            },
          },
          'sass-loader', // Компилирует SCSS/SASS в CSS
        ],
      },

      ////// img
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          // Куда именно в dist складывать картинки и как называть
          filename: 'assets/images/[hash][ext][query]'
        }
      },

      // Обработка шрифтов
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      },
    ]
  },

  /////////////////////
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Откуда сервер берет статику
    },
    compress: true,   // Включает gzip сжатие для скорости
    port: 3000,       // Твой локальный адрес: http://localhost:3000
    open: true,       // Автоматически откроет браузер при старте
    hot: true,        // 🔥 Включает Hot Module Replacement (HMR)
  },

  /////////////////////
  optimization: {
    minimizer: [
      `...`, 
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: { quality: 75, progressive: true },
              png: { quality: 80, palette: true },
              webp: { quality: 75 },
              avif: { quality: 50 },
            },
          },
        },
        
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: { quality: 75 },
              },
            },
          },
        ],
      }),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // Удаляем абсолютно все комментарии из JS
          },
          compress: {
            drop_console: true, // Профессиональный ход: удаляет все console.log из кода
            drop_debugger: true,
          },
        },
        extractComments: false, // Не создавать отдельный файл с лицензиями/комментариями
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
    chunks: 'all', 
  },
  },

  /////////////////////
  resolve: {
  extensions: ['.js', '.jsx', '.ts', '.tsx'], // Добавь TS расширения
  alias: {
    '@': path.resolve(__dirname, 'src'), // Теперь Webpack тоже поймет этот путь
  }
}


};