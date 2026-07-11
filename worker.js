/**
 * Workers + Assets 入口
 * - 处理 /p/:id 商品详情中转（302 跳转 + 白名单校验）
 * - 其余请求回落到静态资源（SPA 单页回退由 wrangler.toml 的 not_found_handling 处理）
 *
 * 部署：wrangler.toml 需配 main = "worker.js"（本文件），再 npx wrangler deploy
 */

const ALLOW_LIST = [
  // 运营商主域
  // '10010.com',               // 联通
  // '10086.cn',                // 移动
  // '189.cn',                  // 电信
  // '10000.cn',                // 电信备用
  // '10099.com.cn',            // 广电
  // 'chinabridgebroadband.com',
  // 第三方号卡 / 卡盟 / 推广平台（覆盖所有子域，两跳都会被放行）
  'yapingkeji.com',          // m20260710.yapingkeji.com + mp.yapingkeji.com + h5.yapingkeji.com
  // TODO: 以后新增合作方，把主域加到这里即可（自动匹配所有子域）
]

function isAllowHost(host) {
  return ALLOW_LIST.some((d) => host === d || host.endsWith('.' + d))
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)

      // 点击上报：/track?id=XX&to=YY（图片 GET 触发，仅记录到控制台，不跳转）
      if (url.pathname === '/track' && request.method === 'GET') {
        console.log('[product-click]', {
          time: new Date().toISOString(),
          product_id: url.searchParams.get('id') || '',
          target: url.searchParams.get('to') || '',
          referer: request.headers.get('referer') || '',
          ua: request.headers.get('user-agent') || '',
          ip: request.headers.get('cf-connecting-ip') || '',
          country: (request.cf && request.cf.country) || '',
        })
        return new Response(null, { status: 204 })
      }

      // 商品详情中转：/p/{id}?to={编码后的真实链接}（备用，仍可用）
      const m = url.pathname.match(/^\/p\/([^/]+)\/?$/)
      if (m && request.method === 'GET') {
        const to = url.searchParams.get('to')
        if (!to) return new Response('missing to', { status: 400 })

        let target
        try {
          target = new URL(to)
        } catch {
          return new Response('bad to', { status: 400 })
        }

        if (target.protocol !== 'http:' && target.protocol !== 'https:') {
          return new Response('bad protocol', { status: 400 })
        }
        if (!isAllowHost(target.hostname)) {
          return new Response('Forbidden: host not allowed -> ' + target.hostname, { status: 403 })
        }

        // 统计点击（先打印到控制台，后续可换 KV / 后端落库）
        const productId = m[1]
        console.log('[product-click]', {
          time: new Date().toISOString(),
          product_id: productId,
          target: target.toString(),
          referer: request.headers.get('referer') || '',
          ua: request.headers.get('user-agent') || '',
          ip: request.headers.get('cf-connecting-ip') || '',
          country: request.cf && request.cf.country || '',
        })

        return Response.redirect(target.toString(), 302)
      }

      // 其余请求回落到静态资源
      if (!env || !env.ASSETS) {
        return new Response('ASSETS binding missing', { status: 500 })
      }
      return env.ASSETS.fetch(request)
    } catch (e) {
      // 调试：把真实异常返回出来，便于排查 500
      return new Response(
        'WORKER_ERROR: ' + (e && (e.stack || e.message) || String(e)),
        { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } }
      )
    }
  },
}
