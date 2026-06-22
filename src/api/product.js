/**
 * 商品相关接口
 * 接口返回格式：{ list: [...], total: Number, page: Number, pageSize: Number }
 *
 * 注意：实际接口可能不支持 carrier 筛选，若不支持则前端自行过滤。
 */
import request from '@/utils/request.js'

/**
 * 获取商品列表
 * @param {Object} params
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @param {number} [params.category] - 运营商 carrier（1=移动,2=联通,3=电信,4=广电）
 */
export function getProductList(params = {}) {
  // 构建 query 参数，去掉 undefined/null 值
  const query = {}
  if (params.page) query.page = params.page
  if (params.pageSize) query.pageSize = params.pageSize
  // 如果接口支持 category 参数则传递，否则前端自行过滤
  if (params.category) query.category = params.category

  return request.post('/api/product/list', query)
}

/**
 * 运营商 carrier 枚举映射
 * 1: 中国移动  2: 中国联通  3: 中国电信  4: 中国广电
 */
export const CARRIER_MAP = {
  1: '中国移动',
  2: '中国联通',
  3: '中国电信',
  4: '中国广电',
}
