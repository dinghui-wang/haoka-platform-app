/**
 * 商品相关接口
 *
 * 后端入参 ProductListRequest：
 *   name        string  - 商品名称（模糊搜索）
 *   carrier     int     - 运营商（1=移动, 2=联通, 3=电信, 4=广电）
 *   age_range   []int   - 年龄范围 [min, max]
 *   issuer_code string  - 归属地编码
 *   page        int     - 页码
 *   page_size   int     - 每页数量
 */
import request from "@/utils/request.js";

/**
 * 获取商品列表
 * @param {Object} params
 * @param {string} [params.name] - 商品名称（模糊搜索）
 * @param {number} [params.carrier] - 运营商（1=移动, 2=联通, 3=电信, 4=广电）
 * @param {number[]} [params.age_range] - 年龄范围 [min, max]
 * @param {string} [params.issuer_code] - 归属地编码
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.page_size=10] - 每页数量
 */
export function getProductList(params = {}) {
  const data = {
    page: params.page || 1,
    page_size: params.page_size || 10,
  };
  if (params.name) data.name = params.name;
  if (params.carrier) data.carrier = params.carrier;
  if (params.age_range) data.age_range = params.age_range;
  if (params.issuer_code) data.issuer_code = params.issuer_code;

  return request.post("/api/product/list", data);
}

/**
 * 运营商 carrier 枚举映射
 * 1: 中国移动  2: 中国联通  3: 中国电信  4: 中国广电
 */
export const CARRIER_MAP = {
  1: "中国移动",
  2: "中国联通",
  3: "中国电信",
  4: "中国广电",
};
