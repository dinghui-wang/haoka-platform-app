<script setup>
import { ref } from 'vue'
import request from '@/utils/request'

const currentTabbar = ref(1)

// 搜索
const phone = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const orders = ref([])

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
    const res = await request.post('/api/order/query', { phone: p })
    // 兼容多种返回格式
    let list = []
    if (Array.isArray(res)) list = res
    else if (res?.list) list = res.list
    else if (res?.data?.list) list = res.data.list
    else if (Array.isArray(res?.data)) list = res.data
    orders.value = list.map(transformOrder)
    if (orders.value.length === 0) {
      uni.showToast({ title: '未查询到相关订单', icon: 'none' })
    }
  } catch (e) {
    console.error('查询失败', e)
    uni.showToast({ title: '查询失败，请重试', icon: 'none' })
    orders.value = []
  } finally {
    searching.value = false
  }
}

function clearPhone() {
  phone.value = ''
  hasSearched.value = false
  orders.value = []
}

function transformOrder(item) {
  return {
    id: item.order_no || item.id || '',
    productName: item.product_name || item.name || '',
    mainImage: item.main_image || '',
    operator: item.carrier_name || item.operator || '',
    status: item.status || item.order_status || '未知',
    statusColor: getStatusColor(item.status || item.order_status),
    price: String(item.price || item.current_monthly || 0),
    createTime: item.create_time || item.created_at || '',
    consignee: item.consignee || item.name || '',
    idCard: maskCard(item.id_card || ''),
    mobile: maskMobile(item.mobile || ''),
    address: maskAddress(item.address || ''),
    trackingNo: item.tracking_no || '',
    orderStatusText: getStatusText(item.status || item.order_status),
    logisticsName: item.logistics_name || item.express_company || '',
    specs: item.detail ? {
      traffic: item.detail.general_traffic,
      directedTraffic: item.detail.directed_traffic,
      voice: item.detail.voice_minutes,
    } : {},
  }
}

function getStatusColor(status) {
  const map = { '已发货': '#2D9D78', '已完成': '#2D9D78', '已激活': '#2D9D78', '待发货': '#E86A17', '待付款': '#E86A17', '处理中': '#4A9FF5' }
  return map[status] || '#999'
}

function getStatusText(status) {
  return status || '未知状态'
}

function maskCard(val) {
  if (!val || val.length < 7) return val
  return val.substring(0, 3) + '*'.repeat(Math.min(12, val.length - 6)) + val.slice(-4)
}

function maskMobile(val) {
  if (!val || val.length < 11) return val
  return val.substring(0, 3) + '****' + val.slice(-4)
}

function maskAddress(val) {
  if (!val) return ''
  if (val.length <= 6) return val
  return val.substring(0, val.length - 3) + '***'
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
          <input
            class="phone-input"
            type="number"
            v-model="phone"
            placeholder="请输入收货人手机号"
            placeholder-class="input-ph"
            maxlength="11"
            confirm-type="search"
            @confirm="doSearch"
          />
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
        <view class="order-card" v-for="(order, index) in orders" :key="index" @click="goDetail(order)">
          <!-- 产品信息行 -->
          <view class="card-product">
            <image v-if="order.mainImage" class="cp-img" :src="order.mainImage" mode="aspectFill" lazy-load />
            <view v-else class="cp-placeholder">
              <text class="cp-ph-icon">📶</text>
            </view>
            <view class="cp-info">
              <text class="cp-name">{{ order.productName }}</text>
              <view class="cp-specs">
                <text class="spec-item" v-if="order.specs.traffic">{{ order.specs.traffic }}G通用流量</text>
                <text class="spec-item" v-if="order.specs.directedTraffic">{{ order.specs.directedTraffic }}G定向</text>
                <text class="spec-item" v-if="order.specs.voice">{{ order.specs.voice }}分钟通话</text>
              </view>
            </view>
          </view>

          <!-- 订单摘要 -->
          <view class="card-summary">
            <view class="sum-line">
              <text class="sum-label">下单时间</text>
              <text class="sum-value">{{ order.createTime }}</text>
            </view>
            <view class="sum-line">
              <text class="sum-label">订单编号</text>
              <text class="sum-value mono">{{ order.id }}</text>
            </view>
            <view class="sum-line">
              <text class="sum-label">订单状态</text>
              <text class="sum-status" :style="{ color: order.statusColor, borderColor: order.statusColor }">
                {{ order.orderStatusText }}
              </text>
            </view>
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
      <view class="tabbar-item" :class="{ active: currentTabbar === 0 }" @click="uni.redirectTo({ url: '/pages/index/index' })">
        <text class="tb-icon">🏠</text><text class="tb-text">首页</text>
      </view>
      <view class="tabbar-item active">
        <text class="tb-icon">📋</text><text class="tb-text">订单</text>
      </view>
      <view class="tabbar-item" :class="{ active: currentTabbar === 2 }" @click="uni.redirectTo({ url: '/pages/local-card/index' })">
        <text class="tb-icon">👤</text><text class="tb-text">本地号卡</text>
      </view>
      <view class="tabbar-item" :class="{ active: currentTabbar === 3 }" @click="uni.redirectTo({ url: '/pages/customer-service/index' })">
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
  width: 200rpx; height: 200rpx;
  top: -40rpx; right: -30rpx;
  background: #fff;
}
.c2 {
  width: 120rpx; height: 120rpx;
  top: 140rpx; left: -20rpx;
  background: rgba(255,255,255,0.3);
}
.c3 {
  width: 80rpx; height: 80rpx;
  bottom: 20rpx; right: 60rpx;
  background: rgba(255,255,255,0.25);
  box-shadow: 0 0 30rpx rgba(255,255,255,0.3);
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

/* 产品行 */
.card-product {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.cp-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  background: #F5F6FA;
  flex-shrink: 0;
}
.cp-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  background: linear-gradient(135deg, #EDF2FF, #E8EBFF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cp-ph-icon {
  font-size: 52rpx;
  opacity: 0.5;
}
.cp-info {
  flex: 1;
  min-width: 0;
}
.cp-name {
  font-size: 27rpx;
  font-weight: 700;
  color: #1A1A2E;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.35;
}
.cp-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}
.spec-item {
  font-size: 20rpx;
  color: #888;
  background: #F5F6FA;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

/* 订单摘要 */
.card-summary {
  border-top: 1rpx solid #F2F3F7;
  padding-top: 18rpx;
}
.sum-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}
.sum-label {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}
.sum-value {
  font-size: 24rpx;
  color: #555;
}
.mono {
  font-family: monospace;
  letter-spacing: 1rpx;
}
.sum-status {
  font-size: 24rpx;
  font-weight: 600;
  border: 1rpx solid currentColor;
  padding: 2rpx 14rpx;
  border-radius: 8rpx;
}

/* 箭头 */
.card-arrow {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36rpx;
  color: #DDD;
  font-weight: bold;
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
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,.06);
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
.tb-icon { font-size: 42rpx; }
.tb-text { font-size: 21rpx; color: #999; }
</style>
