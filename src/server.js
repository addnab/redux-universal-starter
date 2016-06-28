import 'babel-polyfill'

import Koa from 'koa'
import KoaRouter from 'koa-router'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, match, RouterContext } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { devMiddleware, hotMiddleware } from 'koa-webpack-middleware'
import serialize from 'serialize-javascript'
import webpack from 'webpack'

import routes from './routes'
import { configureStore } from './store'
import webpackConfig from '../webpack.config'

const app = new Koa()
const webpackConfigDev = webpackConfig({ dev: true })
const compiler = webpack(webpackConfigDev)

app.use(devMiddleware(compiler), {
  publicPath: webpackConfigDev.output.publicPath,
  noInfo: true,
  stats: {
    colors: true
  }
})

app.use(hotMiddleware(compiler))

const router = new KoaRouter()

const PORT = process.env.PORT || 8080

const HTML = ({ content, store }) => (
  <html>
    <body>
      <div id='root' dangerouslySetInnerHTML={{ __html: content }} />
      <div id='devtools' />
      <script dangerouslySetInnerHTML={{ __html: `window.__initialState__=${serialize(store.getState())};` }} />
      <script src='/bundle.js' />
    </body>
  </html>
)

router
  .get('*', (ctx, next) => {
    const memoryHistory = createMemoryHistory(ctx.url)
    const store = configureStore(memoryHistory)
    const history = syncHistoryWithStore(memoryHistory, store)
    match({ history, routes: routes, location: ctx.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        ctx.status = 500
        ctx.body = error.message
      } else if (redirectLocation) {
        ctx.status = 302
        ctx.redirect(redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
        const content = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>
        )
        ctx.type = 'text/html'
        ctx.body = '<!doctype html>\n' + renderToString(<HTML content={content} store={store} />)
      }
    })
  })

app.use(router.routes())

app.listen(PORT, () => {
  console.log('Production Express server running at localhost:' + PORT)
})
