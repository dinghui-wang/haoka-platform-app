import request from "@/utils/request.js";

/**
 * 通过收货人手机号查询订单
 * 接口：POST /api/order/query
 * 入参：{ phone: string }
 */
export function queryOrdersByPhone(phone) {
  return request.post("/app/order/by-phone", { receiver_phone: phone });
}

// ========== 状态码 / 状态文字 配置 ==========
export const STATUS_TEXT_MAP = {
  1: "待付款",
  2: "待发货",
  3: "已发货",
  4: "已完成",
  5: "已取消",
  6: "处理中",
};

export const STATUS_COLOR_MAP = {
  1: "#E86A17",
  2: "#E86A17",
  3: "#5B8DEF",
  4: "#2D9D78",
  5: "#999999",
  6: "#5B8DEF",
};

export function getStatusText(status) {
  return STATUS_TEXT_MAP[Number(status)] || "未知状态";
}

export function getStatusColor(status, text) {
  const m = STATUS_COLOR_MAP[Number(status)];
  if (m) return m;
  const t = text || "";
  if (t.includes("完成") || t.includes("激活")) return "#2D9D78";
  if (t.includes("发货")) return "#5B8DEF";
  if (t.includes("付款") || t.includes("处理")) return "#E86A17";
  if (t.includes("取消")) return "#999";
  return "#999";
}

/**
 * 将后端 OrderResponse 转换为 UI 友好结构
 * 列表页和详情页共用
 */
export function transformOrder(item) {
  const status = Number(item.status);
  const statusText = item.status_text || getStatusText(status);
  return {
    // 基础
    id: item.id,
    orderNo: item.order_no || "",
    productName: item.product_name || "",
    // 收货人（后端已脱敏）
    receiverName: item.receiver_name || "",
    receiverPhone: item.receiver_phone || "",
    receiverIdCard: item.receiver_id_card || "",
    region: [item.receiver_province, item.receiver_city, item.receiver_district]
      .filter(Boolean)
      .join(" "),
    address: item.receiver_address || "",
    // 号卡专属
    phoneNum: item.phone_num || "",
    iccid: item.iccid || "",
    // 状态
    status,
    statusText,
    statusColor: getStatusColor(status, statusText),
    statusBg: getStatusColor(status, statusText) + "18",
    // 物流
    logisticsCompany: item.logistics_company || "",
    trackingNo: item.tracking_no || "",
    shippedAt: item.shipped_at || "",
    // 首充
    firstRechargeAt: item.first_recharge_at || "",
    firstRechargeAmount: Number(item.first_recharge_amount || 0),
    // 完成 / 取消
    completedAt: item.completed_at || "",
    cancelledAt: item.cancelled_at || "",
    cancelReason: item.cancel_reason || "",
    // 备注
    remark: item.remark || "",
    // 时间
    createTime: item.created_at || "",
    updateTime: item.updated_at || "",
  };
}

/**
 * UTF-8 安全的 base64 编码（兼容中文）
 */
function utf8ToBase64(str) {
  // 把字符串按 UTF-8 编码为字节，再转 base64
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * 把订单对象编码为 URL 参数
 * 使用 base64(JSON) 后再 encodeURIComponent
 */
export function encodeOrderToUrl(order) {
  try {
    const json = JSON.stringify(order);
    return encodeURIComponent(utf8ToBase64(json));
  } catch (e) {
    console.error("encodeOrderToUrl error", e);
    return "";
  }
}

/**
 * 从 URL 参数中解码订单对象
 */
export function decodeOrderFromUrl(encoded) {
  if (!encoded) return null;
  try {
    const json = base64ToUtf8(decodeURIComponent(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error("decodeOrderFromUrl error", e);
    return null;
  }
}
