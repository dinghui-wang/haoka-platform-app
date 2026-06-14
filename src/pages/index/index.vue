<script setup>
import { ref } from 'vue'

// 功能入口数据
const features = ref([
  { icon: '🏷️', name: '6月推荐', sub: '热门套餐', bgColor: 'linear-gradient(135deg, #FFB347, #FFCC80)' },
  { icon: '📱', name: '大流量卡', sub: '192G号卡', bgColor: 'linear-gradient(135deg, #4A9FF5, #81C4FF)' },
  { icon: '🎁', name: '19元月租', sub: '首月免费', bgColor: 'linear-gradient(135deg, #FF6B8A, #FFA0B0)' },
  { icon: '🔗', name: '分享店铺', sub: '终身号卡服务', bgColor: 'linear-gradient(135deg, #FF9966, #FFBB80)' },
])

// 推荐卡片区
const recommendCards = ref([
  {
    badge: 'HOT!', badgeColor: '#FF6B00',
    operator: '中国联通', operatorName: '联通随心卡',
    data: '150', price: '29', priceUnit: '元',
    tag: '联通随心卡29元', age: '18-28岁可申请',
    bgColor: 'linear-gradient(180deg, #FFF5EB 0%, #FFE8D6 100%)',
    dataColor: '#E85D04', logoBg: '#E85D04',
    tagBg: '#FFF0E0', tagColor: '#E85D04'
  },
  {
    badge: 'HOT!', badgeColor: '#FF3333',
    operator: '中国广电', operatorName: '广电动升卡',
    data: '222', price: '29', priceUnit: '元',
    tag: '广电升幅卡29元', age: '18-65岁可申请',
    bgColor: 'linear-gradient(180deg, #F5F0FF 0%, #EDE4FF 100%)',
    dataColor: '#6B21A8', logoBg: '#6B21A8',
    tagBg: '#F0E6FF', tagColor: '#6B21A8'
  },
  {
    badge: 'HC', badgeColor: '#FF6B00',
    operator: '中国移动', operatorName: '移动超值卡',
    data: '135', price: '29', priceUnit: '元',
    tag: '联通超值卡29元', age: '18-28岁可申请',
    bgColor: 'linear-gradient(180deg, #FFF5EB 0%, #FFE8D6 100%)',
    dataColor: '#E85D04', logoBg: '#E85D04',
    tagBg: '#FFF0E0', tagColor: '#E85D04'
  },
])

// 分类标签
const categoryTabs = ref([
  { name: '精选', sub: '猜您喜欢' },
  { name: '联通', sub: '高速流量' },
  { name: '移动', sub: '黄金速率' },
  { name: '电信', sub: '爆款热销' },
  { name: '广电', sub: '超大流量' },
])
const currentTab = ref(0)

// 商品列表
const products = ref([
  {
    operatorShort: '中国联通',
    data: '150',
    detail: '150G通用流量+200分钟通话',
    title: '联通随心卡29元150G+200分钟+会员【发全国】充激活充值后发货',
    tag1: '随机归属地',
    tag2: '18-28岁可申请',
    hot: true,
    metas: ['长期套餐', '本激活本机后发货', '自主激活']
  }
])

// TabBar
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
</script>

<template>
  <view class="page">
    <!-- 顶部蓝色背景区域 -->
    <view class="header-bg">
      <view class="header-content">
        <!-- 标题 -->
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

        <!-- 装饰元素 -->
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

      <!-- 蓝色波浪底部 -->
      <view class="wave-bottom"></view>
    </view>

    <!-- 主要内容区 -->
    <scroll-view scroll-y :show-scrollbar="false" class="main-content">
      <!-- 5G办理中心卡片 -->
      <view class="center-card">
        <view class="center-header">
          <view class="center-logo">
            <view class="logo-inner">
              <text class="logo-text-5g">5G</text>
              <view class="logo-wifi">
                <text>)))</text>
              </view>
            </view>
          </view>
          <view class="center-info">
            <text class="center-title">5G浩卡官方办理中心</text>
            <text class="center-desc">四大运营商授权 官方正品保障</text>
          </view>
        </view>

        <!-- 四个功能入口 -->
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
      <view class="recommend-section">
        <view class="section-header">
          <view class="recommend-tag">
            <text class="tag-main">人气</text>
            <text class="tag-sub">推荐</text>
          </view>
          <view class="card-list">
            <view class="sim-card" v-for="(card, index) in recommendCards" :key="index"
              :style="{ background: card.bgColor }">
              <view class="card-badge" :style="{ background: card.badgeColor }">
                <text class="badge-text">{{ card.badge }}</text>
              </view>
              <view class="card-operator">
                <view class="operator-logo" :style="{ background: card.logoBg }">
                  <text class="operator-text">{{ card.operator }}</text>
                </view>
                <text class="operator-name">{{ card.operatorName }}</text>
              </view>
              <text class="card-data" :style="{ color: card.dataColor }">{{ card.data }}G</text>
              <text class="card-price">{{ card.price }}{{ card.priceUnit }}</text>
              <view class="card-info-row">
                <text class="info-tag" :style="{ background: card.tagBg, color: card.tagColor }">{{ card.tag }}</text>
                <text class="card-age">{{ card.age }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 通知提示条 -->
      <view class="notice-bar">
        <view class="notice-icon">
          <text>🔊</text>
        </view>
        <text class="notice-text">严禁省内产品转寄省外通知</text>
      </view>

      <!-- 分类标签栏 -->
      <view class="category-tabs">
        <view class="tab-item" v-for="(tab, index) in categoryTabs" :key="index"
          :class="{ active: currentTab === index }" @click="currentTab = index">
          <text class="tab-name" :class="{ active: currentTab === index }">{{ tab.name }}</text>
          <text class="tab-sub">{{ tab.sub }}</text>
        </view>
      </view>

      <!-- 搜索栏和筛选 -->
      <view class="search-filter-bar">
        <view class="search-box">
          <text class="search-placeholder">商品名称、运营商</text>
          <text class="search-icon">🔍</text>
        </view>
        <view class="filter-btns">
          <text class="filter-text">筛选 ⬇</text>
          <text class="sort-text">排序 ⇅</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="product-list">
        <view class="product-card" v-for="(product, index) in products" :key="index">
          <view class="product-left">
            <view class="product-sim-card">
              <view class="sim-chip"></view>
              <view class="sim-operator">
                <text>{{ product.operatorShort }}</text>
              </view>
              <text class="sim-data">{{ product.data }}G</text>
              <text class="sim-detail">{{ product.detail }}</text>
            </view>
          </view>
          <view class="product-right">
            <view class="product-hot" v-if="product.hot">
              <text>🔥</text>
            </view>
            <text class="product-title">{{ product.title }}</text>
            <view class="product-tags">
              <text class="tag-orange" v-if="product.tag1">{{ product.tag1 }}</text>
              <text class="tag-green" v-if="product.tag2">{{ product.tag2 }}</text>
            </view>
            <view class="product-meta">
              <text class="meta-item" v-for="(meta, i) in product.metas" :key="i">{{ meta }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部导航栏 (自定义覆盖) -->
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

  /* PC端模拟手机效果 */
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

/* 手机装饰 */
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

/* WiFi装饰 */
.decoration-wifi {
  position: absolute;
  right: 50rpx;
  top: 130rpx;
  opacity: 0.35;
}

.wifi-icon {
  font-size: 56rpx;
}

/* 波浪底 */
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
  margin: 24rpx 24rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.recommend-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx;
  background: linear-gradient(180deg, #FFF5EC, #FFE8D0);
  border-radius: 12rpx;
  flex-shrink: 0;
}

.tag-main {
  font-size: 30rpx;
  font-weight: bold;
  color: #E86A17;
}

.tag-sub {
  font-size: 26rpx;
  font-weight: bold;
  color: #E86A17;
}

.card-list {
  flex: 1;
  display: flex;
  gap: 16rpx;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.sim-card {
  min-width: 210rpx;
  border-radius: 16rpx;
  padding: 16rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.card-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.badge-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #fff;
}

.card-operator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.operator-logo {
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}

.operator-text {
  font-size: 18rpx;
  color: #fff;
  font-weight: bold;
}

.operator-name {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

.card-data {
  font-size: 48rpx;
  font-weight: 900;
  display: block;
  line-height: 1.1;
}

.card-price {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.card-info-row {
  margin-top: 10rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  align-items: center;
}

.info-tag {
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.card-age {
  font-size: 20rpx;
  color: #888;
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
}

.notice-icon {
  font-size: 28rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #D4790A;
  font-weight: 500;
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
  justify-content: space-between;
  background: #FFFFFF;
  padding: 20rpx 24rpx;
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.search-placeholder {
  font-size: 26rpx;
  color: #BBBBBB;
}

.search-icon {
  font-size: 28rpx;
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

.product-sim-card {
  width: 160rpx;
  height: 180rpx;
  background: linear-gradient(135deg, #FFEFED, #FFDAD5);
  border-radius: 16rpx;
  padding: 16rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2rpx solid #FFCCC7;
}

.sim-chip {
  width: 32rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #D4AF37, #FFD700);
  border-radius: 4rpx;
  margin-bottom: 8rpx;
}

.sim-operator {
  font-size: 18rpx;
  color: #C41E3A;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.sim-data {
  font-size: 52rpx;
  font-weight: 900;
  color: #C41E3A;
  line-height: 1;
}

.sim-detail {
  font-size: 18rpx;
  color: #999;
  margin-top: auto;
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
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8rpx;
  padding-right: 40rpx;
}

.product-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
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
  gap: 16rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 22rpx;
  color: #AAAAAA;
  padding: 4rpx 0;
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
