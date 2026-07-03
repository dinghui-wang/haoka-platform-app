<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getProductList, CARRIER_MAP } from '@/api/product.js'

// ========== 通知滚动播报 ==========
// 5G号卡相关文案（上下滚动）
const noticeList = ref([
  '5G号卡新品上线，每月100GB超大流量，低至9元/月',
  '广电5G青春卡，19元月租享192G全国流量',
  '电信5G星卡，首月免费用，激活即送50元话费',
  '联通5G沃派卡，9.9元/月，100G通用+100分钟通话',
  '移动5G花卡，29元月租享200G大流量，全国通用不限速',
])
const noticeIndex = ref(0)
const noticeTransformY = ref(0)
let noticeTimer = null

// 启动通知上下滚动
function startNoticeScroll() {
  if (noticeTimer) return
  noticeTimer = setInterval(() => {
    noticeIndex.value = (noticeIndex.value + 1) % noticeList.value.length
    // 向上平移一条的高度（每条高度 40rpx ≈ 20px，转成 px 用 -40rpx * noticeIndex）
    noticeTransformY.value = -noticeIndex.value * 40
  }, 3000)
}

// 停止通知滚动
function stopNoticeScroll() {
  if (noticeTimer) {
    clearInterval(noticeTimer)
    noticeTimer = null
  }
}

// ========== 功能入口 ==========
const features = ref([
  { icon: '🏷️', name: '6月推荐', sub: '热门套餐', bgColor: 'linear-gradient(135deg, #FFB347, #FFCC80)' },
  { icon: '📱', name: '大流量卡', sub: '192G号卡', bgColor: 'linear-gradient(135deg, #4A9FF5, #81C4FF)' },
  { icon: '🎁', name: '19元月租', sub: '首月免费', bgColor: 'linear-gradient(135deg, #FF6B8A, #FFA0B0)' },
  { icon: '🔗', name: '分享店铺', sub: '终身号卡服务', bgColor: 'linear-gradient(135deg, #FF9966, #FFBB80)' },
])

// ========== 推荐卡片（从商品列表取前3条） ==========
const recommendCards = ref([])

// 运营商颜色配置
const OPERATOR_THEME = {
  1: { badgeColor: '#FF6B00', dataColor: '#E85D04', logoBg: '#E85D04', tagBg: '#FFF0E0', tagColor: '#E85D04', bgGradient: 'linear-gradient(180deg, #FFF5EB 0%, #FFE8D6 100%)' },
  2: { badgeColor: '#FF6B00', dataColor: '#E85D04', logoBg: '#E85D04', tagBg: '#FFF0E0', tagColor: '#E85D04', bgGradient: 'linear-gradient(180deg, #FFF5EB 0%, #FFE8D6 100%)' },
  3: { badgeColor: '#FF3333', dataColor: '#D32F2F', logoBg: '#D32F2F', tagBg: '#FFE8E8', tagColor: '#D32F2F', bgGradient: 'linear-gradient(180deg, #FFE8E8 0%, #FFD6D6 100%)' },
  4: { badgeColor: '#FF3333', dataColor: '#6B21A8', logoBg: '#6B21A8', tagBg: '#F0E6FF', tagColor: '#6B21A8', bgGradient: 'linear-gradient(180deg, #F5F0FF 0%, #EDE4FF 100%)' },
}

// ========== 分类标签 ==========
const categoryTabs = ref([
  { name: '精选', sub: '猜您喜欢', carrier: null },
  { name: '联通', sub: '高速流量', carrier: 2 },
  { name: '移动', sub: '黄金速率', carrier: 1 },
  { name: '电信', sub: '爆款热销', carrier: 3 },
  { name: '广电', sub: '超大流量', carrier: 4 },
])
const currentTab = ref(0)

// ========== 商品列表 ==========
const products = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 搜索关键词
const keyword = ref('')
let searchTimer = null

// 将接口数据转换为推荐卡片格式
function transformToRecommendCard(item) {
  const carrier = item.detail?.carrier || 0
  const theme = OPERATOR_THEME[carrier] || OPERATOR_THEME[2]
  const d = item.detail || {}
  const ageRange = d.min_age && d.max_age ? `${d.min_age}-${d.max_age}岁可申请` : ''
  return {
    id: item.out_product_id,
    main_image: item.main_image,
    main_link: item.main_link,
    operator: CARRIER_MAP[carrier] || '未知',
    operatorName: item.name?.split(/(\d+元)/)?.[0]?.replace(/[\u2700-\u27BF\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2011-\u26FF]/g, '').trim() || '号卡',
    data: String(item.detail?.general_traffic || 0),
    price: String(item.detail?.current_monthly || 0),
    name: item.name,
    badgeColor: theme.badgeColor,
    bgColor: theme.bgGradient,
    dataColor: theme.dataColor,
    logoBg: theme.logoBg,
    ageRange,
  }
}

// 将接口数据转换为商品列表格式
function transformToProduct(item) {
  const carrier = item.detail?.carrier || 0
  const d = item.detail || {}
  const ageRange = d.min_age && d.max_age ? `${d.min_age}-${d.max_age}岁` : ''
  const tags = []
  if (d.general_traffic) tags.push(`${d.general_traffic}G流量`)
  if (d.voice_minutes) tags.push(`${d.voice_minutes}分钟`)
  if (d.recharge_desc) tags.push(d.recharge_desc)

  return {
    id: item.out_product_id,
    out_product_id: item.out_product_id,
    main_image: item.main_image,
    main_link: item.main_link,
    name: item.name,
    carrier,
    operatorShort: CARRIER_MAP[carrier] || '未知',
    data: String(d.general_traffic || 0),
    detail: `${d.general_traffic || 0}G通用流量${d.voice_minutes ? '+' + d.voice_minutes + '分钟通话' : ''}`,
    title: item.name,
    price: d.current_monthly || 0,
    originalPrice: d.origin_monthly || 0,
    commission: d.commission || 0,
    ageRange,
    tag1: ageRange,
    tag2: d.recharge_desc ? d.recharge_desc.slice(0, 15) : '',
    hot: d.commission >= 100,
    metas: [
      d.is_need_idcard ? '需身份证' : '自主激活',
      d.topup_amount ? `首充${d.topup_amount}元` : '',
      d.delivery_type === 'prohibitShipping' ? '禁止转寄' : '全国发货',
    ].filter(Boolean),
    detailObj: d,
  }
}

// 获取商品列表
async function fetchProducts(reset = false) {
  if (reset) {
    page.value = 1
    products.value = []
  }
  loading.value = true
  try {
    const carrier = categoryTabs.value[currentTab.value].carrier
    const res = await getProductList({
      page: page.value,
      page_size: pageSize.value,
      ...(carrier ? { carrier } : {}),
      ...(keyword.value.trim() ? { name: keyword.value.trim() } : {}),
    })

    // 调试：打印接口返回的完整数据
    console.log('接口返回 res =', res)

    // 兼容多种返回格式：
    // 1. { list: [...] }
    // 2. { data: { list: [...] } }
    // 3. { data: [...] }
    // 4. { code: 0, data: { list: [...] } }
    // 5. [...] 直接是数组
    let list = []
    let totalVal = 0
    if (Array.isArray(res)) {
      list = res
    } else if (res?.list) {
      list = res.list
      totalVal = res.total || 0
    } else if (res?.data?.list) {
      list = res.data.list
      totalVal = res.data.total || 0
    } else if (Array.isArray(res?.data)) {
      list = res.data
    } else {
      list = []
    }

    console.log('解析出 list =', list, '数量:', list.length)

    const transformed = list.map(item => transformToProduct(item))

    if (reset) {
      products.value = transformed
    } else {
      products.value.push(...transformed)
    }
    total.value = totalVal || transformed.length

    // 推荐卡片取前3条
    if (reset && transformed.length > 0) {
      recommendCards.value = list.slice(0, 3).map(item => transformToRecommendCard(item))
    }
  } catch (e) {
    console.error('获取商品列表失败', e)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 加载更多
function loadMore() {
  if (loading.value) return
  if (products.value.length >= total.value && total.value > 0) return
  page.value++
  fetchProducts()
}

// 切换分类
function switchCategory(index) {
  if (currentTab.value === index) return
  currentTab.value = index
  fetchProducts(true)
}

// 搜索输入（防抖 500ms 自动搜索）
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchProducts(true)
  }, 500)
}

// 清空搜索
function clearKeyword() {
  keyword.value = ''
  fetchProducts(true)
}

// 跳转商品详情（跳外链）
function goDetail(product) {
  if (product.main_link) {
    // #ifdef H5
    window.open(product.main_link)
    // #endif
    // #ifdef MP-WEIXIN || APP-PLUS
    uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(product.main_link)}` })
    // #endif
  }
}

// ========== TabBar ==========
const currentTabbar = ref(0)
const tabbarItems = ref([
  { icon: '🏠', text: '店铺首页' },
  { icon: '📋', text: '订单查询' },
  { icon: '👤', text: '本地号卡' },
  { icon: '🎧', text: '在线客服' },
])

function switchTab(index) {
  if (index === 0) {
    currentTabbar.value = index
  } else if (index === 1) {
    uni.redirectTo({ url: '/pages/order/index' })
  } else if (index === 2) {
    uni.redirectTo({ url: '/pages/local-card/index' })
  } else if (index === 3) {
    uni.redirectTo({ url: '/pages/customer-service/index' })
  }
}

onMounted(() => {
  fetchProducts(true)
  startNoticeScroll()
})

onUnmounted(() => {
  stopNoticeScroll()
})
</script>

<template>
  <view class="page">
    <!-- 顶部蓝色背景区域 -->
    <view class="header-bg">
      <view class="header-content">
        <view class="title-wrapper">
          <view class="title-decoration left">
            <text class="deco-text">❧</text>
          </view>
          <text class="main-title">号卡精选商城</text>
          <view class="title-decoration right">
            <text class="deco-text">❧</text>
          </view>
        </view>
        <text class="sub-title">精选套餐·号卡大全·畅销正品</text>

        <view class="decoration-phone">
          <view class="phone-icon">
            <view class="phone-screen"></view>
            <view class="phone-home"></view>
          </view>
        </view>
        <view class="decoration-wifi">
          <text class="wifi-icon">📶</text>
        </view>
      </view>
      <view class="wave-bottom"></view>
    </view>

    <!-- 主要内容区 -->
    <scroll-view scroll-y :show-scrollbar="false" class="main-content" @scrolltolower="loadMore">
      <!-- 5G办理中心卡片 -->
      <view class="center-card">
        <view class="center-header">
          <view class="center-logo">
            <view class="logo-inner">
              <text class="logo-text-5g">5G</text>
              <view class="logo-wifi"><text>)))</text></view>
            </view>
          </view>
          <view class="center-info">
            <text class="center-title">5G号卡官方办理中心</text>
            <text class="center-desc">四大运营商授权 官方正品保障</text>
          </view>
        </view>
        <view class="feature-grid">
          <view class="feature-item" v-for="(item, index) in features" :key="index">
            <view class="feature-icon" :style="{ background: item.bgColor }">
              <text class="feature-icon-text">{{ item.icon }}</text>
            </view>
            <text class="feature-name">{{ item.name }}</text>
            <text class="feature-sub">{{ item.sub }}</text>
          </view>
        </view>
      </view>

      <!-- 人气推荐区域 -->
      <view class="recommend-section" v-if="recommendCards.length">
        <view class="recommend-body">
          <!-- 左侧标题区 -->
          <view class="recommend-left">
            <text class="rec-title-text">人气</text>
            <text class="rec-title-text">推荐</text>
            <view class="rec-sim-icon">
              <text class="sim-chip"></text>
            </view>
          </view>
          <!-- 右侧卡片滚动 -->
          <scroll-view scroll-x class="recommend-scroll" :show-scrollbar="false">
            <view class="rec-card" v-for="(card, index) in recommendCards" :key="index"
              :style="{ background: card.bgColor }" @click="goDetail(card)">
              <!-- 顶部：运营商 + HOT -->
              <view class="rec-card-top">
                <view class="rec-carrier-tag" :style="{ background: card.logoBg }">
                  <text class="rec-carrier-text">{{ card.operator }}</text>
                </view>
                <view class="rec-hot-badge">
                  <text class="rec-hot-text">HOT!</text>
                </view>
              </view>
              <!-- 流量大字 -->
              <view class="rec-flow-row">
                <text class="rec-flow-num" :style="{ color: card.dataColor }">{{ card.data }}G</text>
              </view>
              <!-- 套餐名 -->
              <text class="rec-plan-name">{{ card.name }}</text>
              <!-- 底部信息 -->
              <view class="rec-bottom-info">
                <text class="rec-area">随机归属地</text>
                <text class="rec-age" v-if="card.ageRange">{{ card.ageRange }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 通知提示条 -->
      <view class="notice-bar">
        <view class="notice-icon"><text>🔊</text></view>
        <view class="notice-scroll-container">
          <view class="notice-scroll-content" :style="{ transform: `translateY(${noticeTransformY}rpx)` }">
            <text class="notice-text" v-for="(item, index) in noticeList" :key="index">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 分类标签栏 -->
      <view class="category-tabs">
        <view class="tab-item" v-for="(tab, index) in categoryTabs" :key="index"
          :class="{ active: currentTab === index }" @click="switchCategory(index)">
          <text class="tab-name" :class="{ active: currentTab === index }">{{ tab.name }}</text>
          <text class="tab-sub">{{ tab.sub }}</text>
        </view>
      </view>

      <!-- 搜索栏和筛选 -->
      <view class="search-filter-bar">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input class="search-input" type="text" v-model="keyword" placeholder="搜索商品名称"
            placeholder-class="search-placeholder" confirm-type="search" @input="onSearchInput"
            @confirm="fetchProducts(true)" />
          <text v-if="keyword" class="search-clear" @click="clearKeyword">✕</text>
        </view>
        <view class="filter-btns">
          <text class="filter-text">筛选 ⬇</text>
          <text class="sort-text">排序 ⇅</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="product-list">
        <!-- 加载中（首次） -->
        <view v-if="loading && products.length === 0" class="product-loading">
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 商品卡片 -->
        <view class="product-card" v-for="(product, index) in products" :key="product.id || index">
          <!-- 左侧：商品主图 -->
          <view class="product-left">
            <image class="product-image" :src="product.main_image" mode="aspectFill" lazy-load></image>
          </view>

          <!-- 右侧：商品信息 -->
          <view class="product-right">
            <view class="product-hot" v-if="product.hot">
              <text>🔥</text>
            </view>
            <text class="product-title">{{ product.title }}</text>
            <view class="product-price-row">
              <text class="product-price">{{ product.price }}</text>
              <text class="product-price-unit">元/月</text>
              <text class="product-original-price" v-if="product.originalPrice > product.price">
                ¥{{ product.originalPrice }}/月</text>
            </view>
            <view class="product-tags">
              <text class="tag-orange" v-if="product.tag1">{{ product.tag1 }}</text>
              <text class="tag-green" v-if="product.tag2">{{ product.tag2 }}</text>
            </view>
            <view class="product-meta">
              <view class="meta-items">
                <text class="meta-item" v-for="(meta, i) in product.metas" :key="i">{{ meta }}</text>
              </view>
              <text class="action-btn" @click.stop="goDetail(product)">免费领取</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading && products.length > 0" class="product-loading">
          <text class="loading-text">加载更多...</text>
        </view>

        <!-- 没有更多 -->
        <view v-if="!loading && products.length > 0 && products.length >= total" class="product-empty">
          <text class="empty-text">— 已经到底了 —</text>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && products.length === 0" class="product-empty">
          <text class="empty-text">暂无商品，请稍后再来～</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <view class="custom-tabbar">
      <view class="tabbar-item" v-for="(tab, index) in tabbarItems" :key="index"
        :class="{ active: currentTabbar === index }" @click="switchTab(index)">
        <text class="tabbar-icon">{{ tab.icon }}</text>
        <text class="tabbar-text">{{ tab.text }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  max-width: 550px;
  margin: 0 auto;
  background: #F5F6FA;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  @media (min-width: 551px) {
    box-shadow: 0 0 40rpx rgba(0, 0, 0, 0.1);
    border-radius: 20rpx;
    overflow: hidden;
  }
}

/* ====== 顶部蓝色区域 ====== */
.header-bg {
  position: relative;
  background: linear-gradient(180deg, #7BC4F5 0%, #4A9FF5 50%, #3D8FE5 100%);
  padding-top: 60rpx;
  padding-bottom: 120rpx;
  overflow: hidden;
}

.header-content {
  position: relative;
  padding: 40rpx 30rpx;
  z-index: 2;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.title-decoration .deco-text {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
}

.title-decoration.right .deco-text {
  transform: scaleX(-1);
}

.main-title {
  font-size: 52rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  letter-spacing: 8rpx;
}

.sub-title {
  display: block;
  text-align: center;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(74, 159, 245, 0.8);
  padding: 10rpx 36rpx;
  border-radius: 30rpx;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.decoration-phone {
  position: absolute;
  left: 40rpx;
  top: 140rpx;
  opacity: 0.3;
}

.phone-icon {
  width: 60rpx;
  height: 110rpx;
  border: 4rpx solid #fff;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx;
}

.phone-screen {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 4rpx;
}

.phone-home {
  width: 24rpx;
  height: 6rpx;
  background: #fff;
  border-radius: 3rpx;
  margin: 8rpx auto 0;
}

.decoration-wifi {
  position: absolute;
  right: 50rpx;
  top: 130rpx;
  opacity: 0.35;
}

.wifi-icon {
  font-size: 56rpx;
}

.wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: #F5F6FA;
  border-radius: 100% 100% 0 0 / 100%;
}

/* ====== 5G办理中心卡片 ====== */
.main-content {
  flex: 1;
  margin-top: -50rpx;
  overflow-y: auto;
}

.center-card {
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(74, 159, 245, 0.12);
  position: relative;
  z-index: 3;
}

.center-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #F0F2F5;
}

.center-logo {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #E8F4FD, #C9E4FF);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-text-5g {
  font-size: 22rpx;
  font-weight: bold;
  color: #4A9FF5;
}

.logo-wifi {
  font-size: 14rpx;
  color: #4A9FF5;
  letter-spacing: -2rpx;
}

.center-info {
  flex: 1;
}

.center-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1A1A2E;
  display: block;
}

.center-desc {
  font-size: 24rpx;
  color: #4A9FF5;
  margin-top: 6rpx;
  display: block;
}

/* 功能入口网格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.feature-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
}

.feature-icon-text {
  font-size: 44rpx;
}

.feature-name {
  font-size: 26rpx;
  color: #1A1A2E;
  font-weight: 600;
}

.feature-sub {
  font-size: 22rpx;
  color: #999;
}

/* ====== 人气推荐 ====== */
.recommend-section {
  margin: 20rpx 24rpx 0;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.recommend-body {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

/* 左侧标题区 */
.recommend-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: 12rpx 8rpx;
  flex-shrink: 0;
  width: 80rpx;
}

.rec-title-text {
  font-size: 30rpx;
  font-weight: 900;
  color: #E8632A;
  line-height: 1.2;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 6rpx;
}

.rec-sim-icon {
  width: 48rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #FFE8D0, #FFDDB8);
  border-radius: 8rpx;
  margin-top: 8rpx;
  position: relative;
  border: 2rpx solid #F5C99D;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sim-chip {
  width: 24rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #F5D89A, #E8B86D);
  border-radius: 4rpx;
  border: 1rpx solid #D4A85C;
}

/* 右侧滚动区 */
.recommend-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 卡片 */
.rec-card {
  display: inline-flex;
  flex-direction: column;
  width: 200rpx;
  margin-right: 16rpx;
  border-radius: 16rpx;
  padding: 16rpx 14rpx;
  vertical-align: top;
  overflow: hidden;

  &:last-child {
    margin-right: 0;
  }
}

/* 卡片顶部：运营商 + HOT */
.rec-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.rec-carrier-tag {
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.rec-carrier-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #fff;
}

.rec-hot-badge {
  background: linear-gradient(90deg, #FF6B35, #FF4444);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.rec-hot-text {
  font-size: 16rpx;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1rpx;
}

/* 流量大字 */
.rec-flow-row {
  margin-bottom: 6rpx;
}

.rec-flow-num {
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.1;
}

/* 套餐名 */
.rec-plan-name {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

/* 底部信息 */
.rec-bottom-info {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  margin-top: auto;
}

.rec-area {
  font-size: 18rpx;
  color: #999;
}

.rec-age {
  font-size: 18rpx;
  color: #999;
}

/* ====== 通知条 ====== */
.notice-bar {
  margin: 20rpx 24rpx 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(90deg, #FFF8F0, #FFFBF5);
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  border: 1rpx solid #FFE8D0;
  overflow: hidden;
  height: 80rpx;
}

.notice-icon {
  font-size: 28rpx;
  flex-shrink: 0;
  line-height: 40rpx;
  height: 40rpx;
}

.notice-scroll-container {
  flex: 1;
  overflow: hidden;
  height: 40rpx;
  position: relative;
}

.notice-scroll-content {
  display: flex;
  flex-direction: column;
  transition: transform 0.5s ease;
}

.notice-text {
  font-size: 26rpx;
  color: #D4790A;
  font-weight: 500;
  white-space: nowrap;
  height: 40rpx;
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}


@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* ====== 分类标签栏 ====== */
.category-tabs {
  margin: 24rpx 24rpx 0;
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
  transition: all 0.2s;

  &.active {
    background: #4A9FF5;
  }
}

.tab-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;

  &.active {
    color: #fff;
  }
}

.tab-sub {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}

/* ====== 搜索和筛选 ====== */
.search-filter-bar {
  margin: 20rpx 24rpx 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #FFFFFF;
  padding: 16rpx 24rpx;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.search-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.search-placeholder {
  font-size: 26rpx;
  color: #BBBBBB;
}

.search-clear {
  font-size: 28rpx;
  color: #CCCCCC;
  padding: 0 8rpx;
  flex-shrink: 0;
}

.filter-btns {
  display: flex;
  gap: 16rpx;
  white-space: nowrap;
}

.filter-text,
.sort-text {
  font-size: 26rpx;
  color: #555;
  font-weight: 500;
}

/* ====== 商品列表 ====== */
.product-list {
  margin: 24rpx 24rpx 0;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product-card {
  display: flex;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  gap: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

.product-left {
  flex-shrink: 0;
}

.product-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: #F5F6FA;
}

.product-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-hot {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 32rpx;
}

.product-title {
  font-size: 28rpx;
  color: #1A1A2E;
  font-weight: 600;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8rpx;
  padding-right: 40rpx;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-top: 12rpx;
}

.product-price {
  font-size: 40rpx;
  font-weight: 900;
  color: #FF4D4F;
}

.product-price-unit {
  font-size: 22rpx;
  color: #FF4D4F;
  font-weight: 600;
}

.product-original-price {
  font-size: 22rpx;
  color: #BBBBBB;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.product-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.tag-orange {
  font-size: 22rpx;
  color: #E86A17;
  background: #FFF5EC;
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
}

.tag-green {
  font-size: 22rpx;
  color: #2D9D78;
  background: #EDF8F4;
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.meta-items {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 22rpx;
  color: #AAAAAA;
  padding: 4rpx 0;
}

.product-commission {
  margin-top: 8rpx;
}

.commission-text {
  font-size: 22rpx;
  color: #FF4D4F;
  font-weight: 600;
  background: #FFF1F0;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.action-btn {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #FF6B35, #FF4444);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  letter-spacing: 2rpx;
  flex-shrink: 0;
}

/* ====== 加载/空状态/到底 ====== */
.product-loading,
.product-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  background: transparent;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.empty-text {
  font-size: 28rpx;
  color: #BBBBBB;
}

/* ====== 底部占位 ====== */
.bottom-placeholder {
  height: 40rpx;
}

/* ====== 自定义TabBar ====== */
.custom-tabbar {
  width: 100%;
  height: 110rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
  flex-shrink: 0;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 20rpx;

  &.active {
    .tabbar-icon {
      transform: scale(1.1);
    }

    .tabbar-text {
      color: #4A9FF5;
      font-weight: 600;
    }
  }
}

.tabbar-icon {
  font-size: 42rpx;
  transition: transform 0.2s;
}

.tabbar-text {
  font-size: 22rpx;
  color: #999;
  transition: color 0.2s;
}
</style>
