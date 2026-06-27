/**
 * 统一请求工具
 * 封装 uni.request，支持拦截器、错误处理
 */

// 开发环境走 Vite 代理（相对路径），生产环境用完整域名
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// 请求拦截器
function requestInterceptor(config) {
  // 可在此处添加 token 等
  return config;
}

// 响应拦截器
function responseInterceptor(response) {
  const { statusCode, data } = response;
  if (statusCode >= 200 && statusCode < 300) {
    return data;
  }
  // 统一错误处理
  const msg = data?.message || `请求失败(${statusCode})`;
  uni.showToast({ title: msg, icon: "none" });
  return Promise.reject(new Error(msg));
}

/**
 * 发起请求
 * @param {Object} options
 * @param {string} options.url - 接口路径，如 '/api/product/list'
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求体
 * @param {Object} [options.params] - query 参数
 * @param {Object} [options.header] - 请求头
 */
function request(options) {
  const config = requestInterceptor({
    url: BASE_URL + options.url,
    method: (options.method || "GET").toUpperCase(),
    data: options.data,
    header: {
      "Content-Type": "application/json",
      ...options.header,
    },
  });

  // 处理 query 参数
  if (options.params) {
    const sep = config.url.includes("?") ? "&" : "?";
    const qs = Object.entries(options.params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    config.url += sep + qs;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success(res) {
        const result = responseInterceptor(res);
        if (result instanceof Promise) {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      },
      fail(err) {
        const msg = err.errMsg || "网络异常，请稍后重试";
        uni.showToast({ title: msg, icon: "none" });
        reject(new Error(msg));
      },
    });
  });
}

// 便捷方法
request.get = (url, params, options) =>
  request({ url, method: "GET", params, ...options });
request.post = (url, data, options) =>
  request({ url, method: "POST", data, ...options });
request.put = (url, data, options) =>
  request({ url, method: "PUT", data, ...options });
request.del = (url, params, options) =>
  request({ url, method: "DELETE", params, ...options });

export default request;
