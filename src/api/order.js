import request from "@/utils/request.js";

/**
 * 通过收货人手机号查询订单
 * 接口：POST /api/order/query
 * 入参：{ phone: string }
 * 返回结构（成功后由 responseInterceptor 拆出 data 字段）：
 * {
 *   receiver_phone: string,  // 脱敏后的查询号码
 *   orders: [
 *     {
 *       id, order_no, product_name, commission, settled_commission,
 *       receiver_name, receiver_phone, receiver_id_card,
 *       receiver_province, receiver_city, receiver_district, receiver_address,
 *       iccid, phone_num,
 *       status, status_text,
 *       logistics_company, tracking_no, shipped_at,
 *       first_recharge_at, first_recharge_amount,
 *       completed_at, cancelled_at, cancel_reason,
 *       remark, status_logs,
 *       created_at, updated_at
 *     }
 *   ]
 * }
 */
export function queryOrdersByPhone(phone) {
  const data = {
    receiver_phone: phone,
  };
  return request.post("/app/order/by-phone", data);
}
