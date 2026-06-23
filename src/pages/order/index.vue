<script setup>
import { ref } from 'vue'
import { queryOrdersByPhone } from '@/api/order.js'

const currentTabbar = ref(1)

// 搜索
const phone = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const orders = ref([])
const receiverPhone = ref('') // 后端返回的脱敏号码（用于页面回显）

// 查询订单
async function doSearch() {
  const p = phone.value.trim()
  if (!p) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(p)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  searching.value = true
  hasSearched.value = true
  try {
    // request.responseInterceptor 返回的是 HTTP 响应体：
    // { code, message, data: { receiver_phone, orders } }
    const res = await queryOrdersByPhone(p)

    // 业务错误处理（HTTP 200 但 code !== 200）
    if (res?.code !== 200) {
      const msg = res?.message || '查询失败'
      uni.showToast({ title: msg, icon: 'none' })
      orders.value = []
      receiverPhone.value = ''
      return
    }

    // 业务数据在 res.data 中
    const body = res.data || {}
    const list = body.orders || []
    receiverPhone.value = body.receiver_phone || ''
    orders.value = list.map(transformOrder)
    if (orders.value.length === 0) {
      uni.showToast({ title: '未查询到相关订单', icon: 'none' })
    }
  } catch (e) {
    console.error('查询失败', e)
    uni.showToast({ title: '查询失败，请重试', icon: 'none' })
    orders.value = []
    receiverPhone.value = ''
  } finally {
    searching.value = false
  }
}

function clearPhone() {
  phone.value = ''
  hasSearched.value = false
  orders.value = []
  receiverPhone.value = ''
}

// 将后端 OrderResponse 转换为 UI 友好结构
function transformOrder(item) {
  return {
    // 基础
    id: item.id,
    orderNo: item.order_no || '',
    productName: item.product_name || '',
    // 收货人（后端已脱敏）
    receiverName: item.receiver_name || '',
    receiverPhone: item.receiver_phone || '',
    receiverIdCard: item.receiver_id_card || '',
    region: [item.receiver_province, item.receiver_city, item.receiver_district]
      .filter(Boolean).join(' '),
    address: item.receiver_address || '',
    // 号卡专属
    phoneNum: item.phone_num || '',
    iccid: item.iccid || '',
    // 状态
    status: item.status,
    statusText: item.status_text || getStatusText(item.status),
    statusColor: getStatusColor(item.status, item.status_text),
    // 物流
    logisticsCompany: item.logistics_company || '',
    trackingNo: item.tracking_no || '',
    shippedAt: item.shipped_at || '',
    // 首充
    firstRechargeAt: item.first_recharge_at || '',
    firstRechargeAmount: Number(item.first_recharge_amount || 0),
    // 完成 / 取消
    completedAt: item.completed_at || '',
    cancelledAt: item.cancelled_at || '',
    cancelReason: item.cancel_reason || '',
    // 备注
    remark: item.remark || '',
    // 时间
    createTime: item.created_at || '',
    updateTime: item.updated_at || '',
  }
}

// 状态码 -> 文案 / 颜色（兼容后端可能只返回 status 数字）
function getStatusText(status) {
  const map = {
    1: '待付款',
    2: '待发货',
    3: '已发货',
    4: '已完成',
    5: '已取消',
    6: '处理中',
  }
  return map[status] || '未知状态'
}

function getStatusColor(status, text) {
  const map = {
    1: '#E86A17', // 待付款
    2: '#E86A17', // 待发货
    3: '#4A9FF5', // 已发货
    4: '#2D9D78', // 已完成
    5: '#999999', // 已取消
    6: '#4A9FF5', // 处理中
  }
  if (map[status]) return map[status]
  // 兜底按文字判断
  const t = text || ''
  if (t.includes('完成') || t.includes('激活')) return '#2D9D78'
  if (t.includes('发货')) return '#4A9FF5'
  if (t.includes('付款') || t.includes('处理')) return '#E86A17'
  if (t.includes('取消')) return '#999'
  return '#999'
}

function copyText(text) {
  if (!text) return
  uni.setClipboardData({
    data: String(text),
    success: () => uni.showToast({ title: '已复制', icon: 'none' }),
  })
}

// 跳转详情
function goDetail(order) {
  uni.navigateTo({
    url: `/pages/order/detail?id=${order.id}&phone=${phone.value}`
  })
}
</script>

<template>
  <view class="page">
    <!-- ====== 渐变头部区域 ====== -->
    <view class="header-area">
      <!-- 装饰圆 -->
      <view class="deco-circle c1"></view>
      <view class="deco-circle c2"></view>
      <view class="deco-circle c3"></view>
      <!-- 搜索卡片 -->
      <view class="search-card">
        <view class="search-title">
          <text class="title-icon">📋</text>
          <text class="title-text">订单查询</text>
        </view>
        <view class="input-row">
          <text class="input-prefix">📱</text>
          <input class="phone-input" type="number" v-model="phone" placeholder="请输入收货人手机号" placeholder-class="input-ph"
            maxlength="11" confirm-type="search" @confirm="doSearch" />
          <text v-if="phone" class="clear-icon" @click="clearPhone">✕</text>
        </view>
        <button class="search-btn" :class="{ loading: searching }" @click="doSearch">
          {{ searching ? '查询中...' : '立即查询' }}
        </button>
        <text class="tip-text">支持通过收货人手机号查询订单状态</text>
      </view>
    </view>

    <!-- ====== 查询结果区域 ====== -->
    <view class="result-area">
      <!-- 未搜索 -->
      <view v-if="!hasSearched" class="empty-hint">
        <view class="empty-illustration">
          <text class="ill-main">🔍</text>
          <text class="ill-sub">输入手机号开始查询</text>
        </view>
      </view>

      <!-- 有结果 -->
      <scroll-view v-else scroll-y class="result-list" :show-scrollbar="false">
        <!-- 查询归属信息 -->
        <view v-if="receiverPhone" class="result-summary">
          <text class="rs-label">查询号码</text>
          <text class="rs-value">{{ receiverPhone }}</text>
          <text class="rs-count">共 {{ orders.length }} 个订单</text>
        </view>

        <view class="order-card" v-for="order in orders" :key="order.id" @click="goDetail(order)">
          <!-- 卡片头部：状态 + 订单号 -->
          <view class="card-head">
            <view class="head-status"
              :style="{ color: order.statusColor, borderColor: order.statusColor, background: order.statusColor + '15' }">
              {{ order.statusText }}
            </view>
            <view class="head-order-no" @click.stop="copyText(order.orderNo)">
              <text class="ho-label">订单号</text>
              <text class="ho-value mono">{{ order.orderNo }}</text>
              <text class="ho-copy">复制</text>
            </view>
          </view>

          <!-- 产品信息 -->
          <view class="card-product">
            <view class="cp-icon-wrap">
              <text class="cp-icon">📶</text>
            </view>
            <view class="cp-info">
              <text class="cp-name">{{ order.productName }}</text>
              <view class="cp-tags" v-if="order.phoneNum">
                <text class="cp-tag phone">号卡：{{ order.phoneNum }}</text>
              </view>
            </view>
          </view>

          <!-- 关键信息：收货人 / 号卡 / 物流 -->
          <view class="card-rows">
            <!-- 收货人 -->
            <view class="row-item">
              <text class="row-icon">👤</text>
              <text class="row-label">收货人</text>
              <text class="row-value">{{ order.receiverName }}　{{ order.receiverPhone }}</text>
            </view>
            <view class="row-item" v-if="order.receiverIdCard">
              <text class="row-icon">🆔</text>
              <text class="row-label">身份证</text>
              <text class="row-value mono">{{ order.receiverIdCard }}</text>
            </view>
            <view class="row-item" v-if="order.address">
              <text class="row-icon">📍</text>
              <text class="row-label">收货地址</text>
              <text class="row-value ellipsis-2">{{ order.region }} {{ order.address }}</text>
            </view>
            <!-- 物流 -->
            <view class="row-item" v-if="order.logisticsCompany || order.trackingNo">
              <text class="row-icon">🚚</text>
              <text class="row-label">物流</text>
              <text class="row-value">
                {{ order.logisticsCompany || '—' }}
                <text v-if="order.trackingNo" class="mono">　{{ order.trackingNo }}</text>
              </text>
            </view>
            <!-- 首充 -->
            <view class="row-item" v-if="order.firstRechargeAt">
              <text class="row-icon">⚡</text>
              <text class="row-label">首充</text>
              <text class="row-value">
                {{ order.firstRechargeAt }}
                <text v-if="order.firstRechargeAmount > 0">　¥{{ order.firstRechargeAmount }}</text>
              </text>
            </view>
            <!-- 完成时间 -->
            <view class="row-item" v-if="order.completedAt">
              <text class="row-icon">✅</text>
              <text class="row-label">完成时间</text>
              <text class="row-value">{{ order.completedAt }}</text>
            </view>
            <!-- 取消原因 -->
            <view class="row-item cancel" v-if="order.cancelledAt && order.cancelReason">
              <text class="row-icon">⚠️</text>
              <text class="row-label">取消原因</text>
              <text class="row-value">{{ order.cancelReason }}</text>
            </view>
          </view>

          <!-- 卡片底部：下单时间 -->
          <view class="card-foot">
            <text class="foot-time">下单：{{ order.createTime }}</text>
          </view>

          <!-- 底部箭头 -->
          <view class="card-arrow"><text>›</text></view>
        </view>

        <!-- 无结果 -->
        <view v-if="hasSearched && !searching && orders.length === 0" class="no-result">
          <text class="nr-icon">📭</text>
          <text class="nr-text">未找到相关订单</text>
          <text class="nr-tip">请检查手机号是否正确</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航栏 -->
    <view class="custom-tabbar">
      <view class="tabbar-item" :class="{ active: currentTabbar === 0 }"
        @click="uni.redirectTo({ url: '/pages/index/index' })">
        <text class="tb-icon">🏠</text><text class="tb-text">首页</text>
      </view>
      <view class="tabbar-item active">
        <text class="tb-icon">📋</text><text class="tb-text">订单</text>
      </view>
      <view class="tabbar-item" :class="{ active: currentTabbar === 2 }"
        @click="uni.redirectTo({ url: '/pages/local-card/index' })">
        <text class="tb-icon">👤</text><text class="tb-text">本地号卡</text>
      </view>
      <view class="tabbar-item" :class="{ active: currentTabbar === 3 }"
        @click="uni.redirectTo({ url: '/pages/customer-service/index' })">
        <text class="tb-icon">🎧</text><text class="tb-text">客服</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* ========== 页面容器 ========== */
.page {
  max-width: 550px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F6FA;
}

/* ========== 渐变头部 ========== */
.header-area {
  position: relative;
  background: linear-gradient(160deg, #5B8DEF 0%, #7B68EE 50%, #9B59D0 100%);
  padding: 80rpx 32rpx 60rpx;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.c1 {
  width: 200rpx;
  height: 200rpx;
  top: -40rpx;
  right: -30rpx;
  background: #fff;
}

.c2 {
  width: 120rpx;
  height: 120rpx;
  top: 140rpx;
  left: -20rpx;
  background: rgba(255, 255, 255, 0.3);
}

.c3 {
  width: 80rpx;
  height: 80rpx;
  bottom: 20rpx;
  right: 60rpx;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 30rpx rgba(255, 255, 255, 0.3);
}

/* 搜索卡片 */
.search-card {
  position: relative;
  z-index: 1;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 40rpx 32rpx 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(91, 141, 239, 0.25);
}

.search-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.title-icon {
  font-size: 36rpx;
}

.title-text {
  font-size: 38rpx;
  font-weight: 900;
  color: #1A1A2E;
  letter-spacing: 2rpx;
}

.input-row {
  display: flex;
  align-items: center;
  background: #F7F8FC;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid transparent;
  transition: border-color .2s;

  &:focus-within {
    border-color: #5B8DEF;
  }
}

.input-prefix {
  font-size: 30rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.phone-input {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
  color: #333;
}

.input-ph {
  color: #BFBFBF;
  font-size: 26rpx;
}

.clear-icon {
  font-size: 26rpx;
  color: #ccc;
  padding: 8rpx;
  flex-shrink: 0;
}

.search-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  background: linear-gradient(135deg, #5B8DEF, #7B68EE);
  border-radius: 44rpx;
  border: none;
  letter-spacing: 4rpx;
  box-shadow: 0 8rpx 24rpx rgba(91, 141, 239, 0.35);
  transition: transform .15s, opacity .15s;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }

  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
}

.tip-text {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #AAA;
  margin-top: 18rpx;
}

/* ========== 结果区域 ========== */
.result-area {
  flex: 1;
  padding: 0 24rpx 140rpx;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.ill-main {
  font-size: 100rpx;
  opacity: 0.6;
}

.ill-sub {
  font-size: 26rpx;
  color: #BBB;
}

/* 订单卡片 */
.result-list {
  max-height: calc(100vh - 520rpx);
  padding-top: 20rpx;
}

/* 查询结果顶部摘要 */
.result-summary {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 16rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.rs-label {
  color: #999;
}

.rs-value {
  color: #5B8DEF;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.rs-count {
  margin-left: auto;
  color: #BBB;
  font-size: 22rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  &:active {
    background: #FAFBFF;
  }
}

/* 卡片头部：状态 + 订单号 */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 18rpx;
  border-bottom: 1rpx dashed #EDEFF5;
  padding-right: 40rpx;
}

.head-status {
  font-size: 24rpx;
  font-weight: 700;
  border: 1rpx solid currentColor;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.head-order-no {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  flex: 1;
  margin-left: 14rpx;
  overflow: hidden;
}

.ho-label {
  font-size: 22rpx;
  color: #BBB;
  flex-shrink: 0;
}

.ho-value {
  font-size: 22rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.ho-copy {
  font-size: 20rpx;
  color: #5B8DEF;
  background: #EDF2FF;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
}

/* 产品行 */
.card-product {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 18rpx;
}

.cp-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #EDF2FF, #E8EBFF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cp-icon {
  font-size: 44rpx;
  opacity: 0.7;
}

.cp-info {
  flex: 1;
  min-width: 0;
}

.cp-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1A1A2E;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.cp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.cp-tag {
  font-size: 20rpx;
  padding: 3rpx 12rpx;
  border-radius: 6rpx;
  background: #F5F6FA;
  color: #888;

  &.phone {
    background: #E8F4FD;
    color: #4A9FF5;
    font-weight: 600;
  }
}

/* 信息行 */
.card-rows {
  background: #F9FAFC;
  border-radius: 12rpx;
  padding: 6rpx 16rpx;
}

.row-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #F0F2F5;
  font-size: 24rpx;

  &:last-child {
    border-bottom: none;
  }

  &.cancel .row-value {
    color: #E86A17;
  }
}

.row-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
  line-height: 1.4;
}

.row-label {
  font-size: 24rpx;
  color: #999;
  width: 110rpx;
  flex-shrink: 0;
  line-height: 1.4;
}

.row-value {
  flex: 1;
  color: #444;
  line-height: 1.4;
  word-break: break-all;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片底部 */
.mono {
  font-family: monospace;
  letter-spacing: 1rpx;
}

.card-foot {
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F2F3F7;
  padding-right: 40rpx;
}

.foot-time {
  font-size: 22rpx;
  color: #BBB;
}

/* 箭头 */
.card-arrow {
  position: absolute;
  right: 24rpx;
  top: 36rpx;
  font-size: 36rpx;
  color: #DDD;
  font-weight: bold;
  line-height: 1;
}

/* 无结果 */
.no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  gap: 12rpx;
}

.nr-icon {
  font-size: 90rpx;
  opacity: 0.45;
}

.nr-text {
  font-size: 28rpx;
  color: #999;
}

.nr-tip {
  font-size: 24rpx;
  color: #CCC;
}

/* ========== 底部导航 ========== */
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 550px;
  height: 110rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, .06);
  z-index: 99;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  &.active .tb-text {
    color: #7B68EE;
    font-weight: 600;
  }
}

.tb-icon {
  font-size: 42rpx;
}

.tb-text {
  font-size: 21rpx;
  color: #999;
}
</style>
