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
  'chinabridgebroadband.com',
  // 第三方号卡 / 卡盟 / 推广平台（按你实际合作情况补全）
  'yapingkeji.com',          // 示例：请替换/补充
  // 'wanka.com',               // 示例
  // 'chuangkit.com',           // 示例
  // 'haoka.com',               // 示例
  // TODO: 把你真实合作的所有号卡店铺 / 推广平台域名都列进来
]

function isAllowHost(host) {
  return ALLOW_LIST.some((d) => host === d || host.endsWith('.' + d))
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // 商品详情中转：/p/{id}?to={编码后的真实链接}
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
        return new Response('Forbidden: host not allowed', { status: 403 })
      }

      // TODO: 统计点击 / 同步订单追踪（env.PV_KV?.put 或 fetch 后端）

      return Response.redirect(target.toString(), 302)
    }

    // 其余请求回落到静态资源
    return env.ASSETS.fetch(request)
  },
}
