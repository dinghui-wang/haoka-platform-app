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

// ========== 核心权益卖点 ==========
const benefits = ref([
  { icon: '🛡️', text: '官方授权正品' },
  { icon: '🚚', text: '全国包邮到家' },
  { icon: '💳', text: '0元免费领卡' },
  { icon: '♻️', text: '随时免费注销' },
])

// ========== 人气推荐卡片 ==========
// 注意：人气推荐区与下方「分类标签 + 商品列表」是相互独立的模块。
// 目前后端尚未提供专属的推荐接口，临时复用 getProductList，
// 取返回结果的前 4 条作为推荐位数据。
// 后续待后端单独提供「人气推荐」接口后，仅需替换下方 fetchRecommendCards 内部的请求实现，
// 上层 UI（recommend-section）无需改动。
const RECOMMEND_LIMIT = 4 // 推荐位固定取前 4 条
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
    title: item.name,
    price: d.current_monthly || 0,
    originalPrice: d.origin_monthly || 0,
    commission: d.commission || 0,
    ageRange,
    tag1: ageRange,
    tag2: d.recharge_desc || '',
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
  } catch (e) {
    console.error('获取商品列表失败', e)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// ========== 人气推荐（独立模块） ==========
// 该函数只负责「人气爆款推荐」区的渲染数据，
// 与分类标签切换、搜索、分页加载等逻辑完全解耦，
// 因此切换分类标签时推荐区不会跟着变化。
async function fetchRecommendCards() {
  try {
    // 临时方案：复用商品列表接口，不传 carrier（即不区分运营商），取前 4 条。
    // TODO: 后续替换为后端专属的人气推荐接口，例如 getRecommendProducts()。
    const res = await getProductList({
      page: 1,
      page_size: RECOMMEND_LIMIT, // 仅取前 4 条
    })

    // 兼容多种返回格式（与 fetchProducts 保持一致）
    let list = []
    if (Array.isArray(res)) {
      list = res
    } else if (res?.list) {
      list = res.list
    } else if (res?.data?.list) {
      list = res.data.list
    } else if (Array.isArray(res?.data)) {
      list = res.data
    }

    // 取接口返回的前 4 条，转换为推荐卡片
    recommendCards.value = list
      .slice(0, RECOMMEND_LIMIT)
      .map(item => transformToRecommendCard(item))
  } catch (e) {
    console.error('获取人气推荐失败', e)
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

// 跳转商品详情
// 解析 main_link 的 query（goods_id/agent_id/...），直接构造 h5.yapingkeji.com 落地 URL
// 跳过 m2026... / mp. 中转（这两层有反盗链、第三方 cookie 拦截，会导致 iframe 空白）
// h5.yapingkeji.com 允许被嵌、且本身就是同一主域，体验上比 main_link 跳两跳更顺畅
// 真实合作方域名可通过 setH5Base() 动态调整
const H5_BASE = 'https://h5.yapingkeji.com/#/pages/detail/index'

function buildH5Url(mainLink) {
  try {
    const u = new URL(mainLink)
    const sp = u.searchParams
    const qs = ['goods_id', 'agent_id', '__s']  // 按合作方协议带过去
      .filter((k) => sp.has(k))
      .map((k) => `${k}=${encodeURIComponent(sp.get(k))}`)
      .join('&')
    return qs ? `${H5_BASE}?${qs}` : H5_BASE
  } catch {
    return mainLink  // main_link 解析失败时兜底跳原链
  }
}

function goDetail(product) {
  if (!product.main_link) return
  const h5Url = buildH5Url(product.main_link)
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent(h5Url)}&id=${encodeURIComponent(product.id || '')}`,
  })
}

onMounted(() => {
  fetchProducts(true)        // 分类商品列表（受分类标签影响）
  fetchRecommendCards()      // 人气推荐（独立加载，不受分类切换影响）
  startNoticeScroll()
})

onUnmounted(() => {
  stopNoticeScroll()
})
</script>

<template>
  <view class="page">
    <!-- 顶部深红/紫红渐变背景区域 -->
    <view class="header-bg">
      <view class="header-content">
        <!-- 左侧：红蓝渐变胶囊Logo -->
        <view class="logo-pill">
          <view class="logo-icon">
            <view class="logo-inner">
              <text class="logo-text-5g">5G</text>
              <view class="logo-wifi"><text>)))</text></view>
            </view>
          </view>
          <view class="logo-text-group">
            <text class="main-title">号卡精选商城</text>
            <text class="sub-title">精选套餐·号卡大全·畅销正品</text>
          </view>
        </view>
        <!-- 右侧：脉冲动画图标 -->
        <view class="header-actions">
          <view class="action-icon pulse-star">
            <text class="action-icon-text">⭐</text>
          </view>
          <view class="action-icon pulse-sparkle">
            <text class="action-icon-text">✦</text>
          </view>
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
        <view class="benefit-strip">
          <view class="benefit-item" v-for="(item, index) in benefits" :key="index">
            <view class="benefit-icon">
              <text class="benefit-icon-text">{{ item.icon }}</text>
            </view>
            <text class="benefit-text">{{ item.text }}</text>
          </view>
        </view>
      </view>

      <!-- 人气推荐区域 -->
      <view class="recommend-section" v-if="recommendCards.length">
        <!-- 顶部标题行 -->
        <view class="rec-header">
          <view class="rec-header-left">
            <text class="rec-header-title">人气爆款推荐</text>
            <view class="rec-header-hot">
              <text class="rec-header-hot-text">HOT</text>
            </view>
          </view>
          <text class="rec-header-more">滑动查看更多 ›</text>
        </view>
        <!-- 下方卡片横滚 -->
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
        <!-- 滑动指示椭圆：单元素平移，切换时缓动滑到目标 tab -->
        <view class="tab-indicator" :style="{ transform: `translateX(${currentTab * 100}%)` }"></view>
        <view class="tab-item" v-for="(tab, index) in categoryTabs" :key="index"
          :class="{ active: currentTab === index }" @click="switchCategory(index)">
          <text class="tab-name">{{ tab.name }}</text>
          <text class="tab-sub">{{ tab.sub }}</text>
        </view>
      </view>

      <!-- 搜索栏和筛选 -->
      <view class="search-filter-bar">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input class="search-input" type="text" v-model="keyword" placeholder="搜你想办的套餐"
            placeholder-class="search-placeholder" confirm-type="search" @input="onSearchInput"
            @confirm="fetchProducts(true)" />
          <text v-if="keyword" class="search-clear" @click="clearKeyword">✕</text>
        </view>
        <view class="filter-btn">
          <text class="filter-icon">☰</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="product-list">
        <!-- 加载中（首次） -->
        <view v-if="loading && products.length === 0" class="product-loading">
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 商品卡片：上图下文纵向布局 -->
        <view class="product-card" v-for="(product, index) in products" :key="product.id || index">
          <!-- 顶部：商品主图 -->
          <view class="product-image-wrapper">
            <image class="product-image" :src="product.main_image" mode="aspectFill" lazy-load></image>
            <view class="product-hot" v-if="product.hot">
              <text>🔥</text>
            </view>
            <view class="product-operator-badge">
              <text class="operator-badge-text">{{ product.operatorShort }}</text>
            </view>
          </view>

          <!-- 底部：商品信息 -->
          <view class="product-info">
            <text class="product-title">{{ product.title }}</text>

            <!-- 月租 + 流量 并列展示（月租在前） -->
            <view class="product-stat-row">
              <view class="stat-block stat-rent">
                <text class="stat-symbol">¥</text>
                <text class="stat-num">{{ product.price }}</text>
                <text class="stat-unit">/月</text>
              </view>
              <text class="stat-original" v-if="product.originalPrice > product.price">
                ¥{{ product.originalPrice }}/月
              </text>
              <view class="stat-divider"></view>
              <view class="stat-block stat-flow">
                <text class="stat-num">{{ product.data }}</text>
                <text class="stat-unit">G</text>
              </view>
            </view>

            <!-- 标签（完整显示） -->
            <view class="product-tags">
              <text class="tag-glow" v-if="product.tag1">{{ product.tag1 }}</text>
              <text class="tag-glow" v-if="product.tag2">{{ product.tag2 }}</text>
            </view>

            <!-- 元信息 + 领取按钮 -->
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
    <tab-bar :current="0" />
  </view>
</template>

<style lang="scss" scoped>
/* 主题变量已集中收口于 src/uni.scss（页面基底 / 卡片 / 圆角 / 文字 / 强调色），此处直接复用 */

/* ====== 页面基底 ====== */
.page {
  background: $page-bg;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ====== 顶部浅色品牌渐变区域 ====== */
.header-bg {
  position: relative;
  background: linear-gradient(135deg, #EDF2FF 0%, #E8EBFF 100%);
  padding-top: 60rpx;
  padding-bottom: 120rpx;
  overflow: hidden;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  z-index: 2;
}

/* ====== 左侧胶囊Logo ====== */
.logo-pill {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: linear-gradient(135deg, #5B8DEF, #7B68EE);
  padding: 16rpx 28rpx;
  border-radius: $radius-pill;
  box-shadow: 0 4rpx 14rpx rgba(91, 141, 239, 0.22);
}

.logo-icon {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.logo-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-text-5g {
  font-size: 22rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.logo-wifi {
  font-size: 14rpx;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: -2rpx;
}

.logo-text-group {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.main-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.sub-title {
  font-size: 22rpx;
  color: rgba(0, 0, 0, 0.45);
}

/* ====== 右侧脉冲动画图标 ====== */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.action-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-text {
  font-size: 32rpx;
  color: #5A4A52;
}

.pulse-star {
  animation: pulse-star 2s ease-in-out infinite;
}

.pulse-sparkle {
  animation: pulse-sparkle 2.5s ease-in-out infinite 0.5s;
}

@keyframes pulse-star {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(91, 141, 239, 0.25);
  }

  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8rpx rgba(91, 141, 239, 0);
  }
}

@keyframes pulse-sparkle {

  0%,
  100% {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 0 0 0 rgba(127, 209, 176, 0.25);
  }

  50% {
    transform: scale(1.05) rotate(45deg);
    box-shadow: 0 0 0 8rpx rgba(127, 209, 176, 0);
  }
}

/* ====== 波浪底部 ====== */
.wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: $page-bg;
  border-radius: 100% 100% 0 0 / 100%;
}

/* ====== 主内容区 ====== */
.main-content {
  flex: 1;
  margin-top: -50rpx;
  overflow-y: auto;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* ====== 5G办理中心卡片 ====== */
.center-card {
  margin: 0 24rpx;
  background: $card-bg;
  border: 1rpx solid $card-border;
  border-radius: $radius-card;
  padding: 32rpx 24rpx;
  box-shadow: $card-glow;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 3;
}

.center-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.center-logo {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(91, 141, 239, 0.12), rgba(123, 104, 238, 0.12));
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
}

.center-logo .logo-text-5g {
  color: $accent-gold;
}

.center-logo .logo-wifi {
  color: $accent-gold;
}

.center-info {
  flex: 1;
}

.center-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  display: block;
}

.center-desc {
  font-size: 24rpx;
  color: $accent-gold;
  margin-top: 6rpx;
  display: block;
}

/* 核心权益卖点条 */
.benefit-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 20rpx 16rpx;
  border-radius: $radius-card;
  background: rgba(0, 0, 0, 0.025);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.benefit-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1rpx;
    height: 44rpx;
    background: rgba(0, 0, 0, 0.06);
  }

  &:last-child::after {
    display: none;
  }
}

.benefit-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.benefit-icon-text {
  font-size: 32rpx;
}

.benefit-text {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.2;
}

/* ====== 人气推荐（上下结构） ====== */
.recommend-section {
  margin: 20rpx 24rpx 0;
  background: $card-bg;
  border: 1rpx solid $card-border;
  border-radius: $radius-card;
  padding: 24rpx 24rpx 28rpx;
  box-shadow: $card-glow;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 顶部标题行 */
.rec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.rec-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.rec-header-title {
  font-size: 32rpx;
  font-weight: 900;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.rec-header-hot {
  background: linear-gradient(135deg, #FF7A45, #FF4D4F);
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  transform: skewX(-8deg);

  .rec-header-hot-text {
    display: block;
    font-size: 20rpx;
    font-weight: 900;
    color: #fff;
    letter-spacing: 1rpx;
    transform: skewX(8deg);
  }
}

.rec-header-more {
  font-size: 22rpx;
  color: $text-secondary;
  letter-spacing: 1rpx;
}

/* 横滚容器 */
.recommend-scroll {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 卡片（浅色，沿用各运营商渐变背景） */
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
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #FF6B6B, #E5484D);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(229, 72, 77, 0.4);
  animation: hotPulse 1.6s ease-in-out infinite;

  /* 斜向高光扫过 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 70%;
    height: 100%;
    background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%);
    transform: skewX(-20deg);
    animation: hotShine 2.4s ease-in-out infinite;
  }
}

.rec-hot-text {
  position: relative;
  z-index: 1;
  font-size: 16rpx;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1rpx;
}

/* 徽标呼吸脉冲 */
@keyframes hotPulse {
  0%, 100% {
    box-shadow: 0 2rpx 8rpx rgba(229, 72, 77, 0.35);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 4rpx 16rpx rgba(229, 72, 77, 0.65);
    transform: scale(1.08);
  }
}

/* 高光扫光 */
@keyframes hotShine {
  0% { left: -120%; }
  55%, 100% { left: 150%; }
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
  color: #555;
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
  color: #888;
}

.rec-age {
  font-size: 18rpx;
  color: #888;
}

/* ====== 通知条 ====== */
.notice-bar {
  margin: 20rpx 24rpx 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(91, 141, 239, 0.06);
  border: 1rpx solid rgba(91, 141, 239, 0.12);
  border-radius: 16rpx;
  overflow: hidden;
  height: 60rpx;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  color: $accent-gold;
  font-weight: 500;
  white-space: nowrap;
  height: 40rpx;
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== 分类标签栏 ====== */
.category-tabs {
  position: relative;                  // 让指示椭圆可绝对定位
  margin: 24rpx 24rpx 0;
  display: flex;
  background: $card-bg;
  border: 1rpx solid $card-border;
  border-radius: $radius-pill;
  box-shadow: $card-glow;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 8rpx;
}

/* 滑动指示椭圆：唯一会移动的元素，靠 transform 缓动滑到目标 tab */
.tab-indicator {
  position: absolute;
  top: 8rpx;
  bottom: 8rpx;
  left: 8rpx;
  width: calc((100% - 16rpx) / 5);     // 与每个 tab 等宽（共 5 个）
  border: 2rpx solid $accent-primary;
  border-radius: $radius-pill;
  background: $card-bg;
  box-shadow: 0 2rpx 10rpx rgba(91, 141, 239, 0.22);
  z-index: 0;
  pointer-events: none;
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item {
  position: relative;
  z-index: 1;                          // 文字压在指示椭圆之上
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14rpx 8rpx;
  border-radius: $radius-pill;
}

.tab-name {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 500;
  line-height: 1.2;
  transition: color 0.34s ease, font-weight 0.34s ease;

  .tab-item.active & {
    color: $accent-primary;
    font-weight: 700;
  }
}

.tab-sub {
  font-size: 20rpx;
  color: rgba(0, 0, 0, 0.3);
  margin-top: 4rpx;
  line-height: 1.2;
  transition: color 0.34s ease;

  .tab-item.active & {
    color: rgba(91, 141, 239, 0.75);
  }
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
  background: $card-bg;
  border: 1rpx solid $card-border;
  padding: 16rpx 24rpx;
  border-radius: $radius-pill;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-icon {
  font-size: 28rpx;
  flex-shrink: 0;
  color: $text-secondary;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: $text-primary;
}

.search-placeholder {
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.3);
}

.search-clear {
  font-size: 28rpx;
  color: $text-secondary;
  padding: 0 8rpx;
  flex-shrink: 0;
}

.filter-btn {
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $card-bg;
  border: 1rpx solid $card-border;
  border-radius: 50%;
  box-shadow: $card-glow;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.filter-icon {
  font-size: 32rpx;
  color: $text-primary;
  line-height: 1;
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
  flex-direction: column;
  background: $card-bg;
  border: 1rpx solid $card-border;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $card-glow;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
}

/* 商品图片区域 */
.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  background: #EFEFF2;
}

.product-hot {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  font-size: 36rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.product-operator-badge {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background: linear-gradient(135deg, $accent-primary, $accent-red);
  padding: 6rpx 16rpx;
  border-radius: $radius-pill;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.18);
}

.operator-badge-text {
  font-size: 20rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 商品信息区域 */
.product-info {
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 600;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  margin-bottom: 16rpx;
}

/* 流量 + 月租 并列两栏 */
.product-stat-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 14rpx;
}

.stat-block {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1;
}

.stat-symbol {
  font-size: 22rpx;
  font-weight: bold;
  margin-right: 2rpx;
}

.stat-unit {
  font-size: 22rpx;
  font-weight: 600;
  margin-left: 2rpx;
}

/* 月租=品牌紫，流量=品牌蓝，各自纯色不混用，对比鲜明 */
.stat-rent .stat-num,
.stat-rent .stat-symbol,
.stat-rent .stat-unit {
  color: $accent-secondary;
}

.stat-flow .stat-num,
.stat-flow .stat-unit {
  color: $accent-primary;
}

.stat-divider {
  width: 1rpx;
  height: 32rpx;
  background: rgba(0, 0, 0, 0.12);
  align-self: center;
}

.stat-original {
  font-size: 22rpx;
  color: rgba(0, 0, 0, 0.3);
  text-decoration: line-through;
  margin-left: 8rpx;
}

/* 标签 */
.product-tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.tag-glow {
  font-size: 22rpx;
  color: $accent-gold;
  background: rgba(217, 154, 46, 0.1);
  border: 1rpx solid rgba(217, 154, 46, 0.22);
  padding: 6rpx 16rpx;
  border-radius: $radius-pill;
}

/* 元信息 + 领取按钮 */
.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4rpx;
}

.meta-items {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  flex: 1;
}

.meta-item {
  font-size: 22rpx;
  color: $text-secondary;
  padding: 4rpx 0;
}

.action-btn {
  font-size: 26rpx;
  font-weight: bold;
  color: #FFFFFF;
  background: linear-gradient(135deg, $accent-primary, $accent-red);
  padding: 16rpx 36rpx;
  border-radius: $radius-pill;
  letter-spacing: 2rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.18);
  text-align: center;
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
  color: $text-secondary;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.3);
}

/* ====== 底部占位 ====== */
.bottom-placeholder {
  height: 40rpx;
}

</style>
