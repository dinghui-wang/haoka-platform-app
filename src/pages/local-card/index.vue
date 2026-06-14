<script setup>
import { ref } from 'vue'

const currentTabbar = ref(2)

// 本地号卡数据
const localCards = ref([
    {
        city: '北京',
        operator: '中国移动',
        data: '135',
        price: '29',
        title: '北京移动本地卡29元135G',
        features: ['本地归属地', '上门激活', '本地优惠']
    },
    {
        city: '北京',
        operator: '中国联通',
        data: '150',
        price: '39',
        title: '北京联通本地卡39元150G',
        features: ['本地归属地', '自主激活', '长期套餐']
    }
])

const cities = ref(['北京', '上海', '广州', '深圳', '杭州', '成都'])
const selectedCity = ref('北京')
</script>

<template>
    <view class="page">
        <!-- 顶部背景 -->
        <view class="header-bg">
            <view class="header-content">
                <text class="page-title">本地号卡</text>
                <text class="page-subtitle">选择您的本地优惠套餐</text>
            </view>
        </view>

        <!-- 城市选择 -->
        <view class="city-selector">
            <scroll-view scroll-x class="city-scroll">
                <view class="city-item" v-for="(city, index) in cities" :key="index"
                    :class="{ active: selectedCity === city }" @click="selectedCity = city">
                    <text class="city-text">{{ city }}</text>
                </view>
            </scroll-view>
        </view>

        <!-- 号卡列表 -->
        <scroll-view scroll-y class="card-list">
            <view class="local-card" v-for="(card, index) in localCards" :key="index">
                <view class="card-header">
                    <view class="city-badge">
                        <text class="city-name">{{ card.city }}</text>
                    </view>
                    <view class="operator-logo" :class="card.operator">
                        <text class="operator-text">{{ card.operator }}</text>
                    </view>
                </view>

                <view class="card-body">
                    <text class="card-title">{{ card.title }}</text>
                    <view class="data-display">
                        <text class="data-amount">{{ card.data }}</text>
                        <text class="data-unit">G</text>
                    </view>
                    <text class="card-price">¥{{ card.price }}/月</text>
                </view>

                <view class="card-features">
                    <text class="feature-tag" v-for="(feature, i) in card.features" :key="i">{{ feature }}</text>
                </view>

                <view class="card-action">
                    <view class="apply-btn">立即办理</view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="localCards.length === 0">
                <text class="empty-icon">📱</text>
                <text class="empty-text">该城市暂无号卡套餐</text>
            </view>
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

<script>
export default {
    data() {
        return {
            tabbarItems: [
                { icon: '🏠', text: '店铺首页' },
                { icon: '📋', text: '订单查询' },
                { icon: '👤', text: '本地号卡' },
                { icon: '🎧', text: '在线客服' }
            ]
        }
    },
  methods: {
    switchTab(index) {
      if (index === 0) {
        uni.redirectTo({ url: '/pages/index/index' })
      } else if (index === 1) {
        uni.redirectTo({ url: '/pages/order/index' })
      } else if (index === 2) {
        // 当前页面不需要跳转
      } else if (index === 3) {
        uni.redirectTo({ url: '/pages/customer-service/index' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
    max-width: 550px;
    margin: 0 auto;
    background: #F5F6FA;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header-bg {
    background: linear-gradient(180deg, #7BC4F5 0%, #4A9FF5 100%);
    padding: 60rpx 30rpx 40rpx;
}

.header-content {
    text-align: center;
}

.page-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #FFFFFF;
    display: block;
}

.page-subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 8rpx;
    display: block;
}

/* 城市选择器 */
.city-selector {
    background: #FFFFFF;
    padding: 20rpx 0;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.city-scroll {
    white-space: nowrap;
    padding: 0 24rpx;

    &::-webkit-scrollbar {
        display: none;
    }
}

.city-item {
    display: inline-block;
    padding: 16rpx 32rpx;
    margin-right: 16rpx;
    border-radius: 30rpx;
    background: #F5F6FA;
    transition: all 0.3s;

    &.active {
        background: #4A9FF5;

        .city-text {
            color: #FFFFFF;
        }
    }
}

.city-text {
    font-size: 26rpx;
    color: #666;
}

/* 号卡列表 */
.card-list {
    flex: 1;
    padding: 24rpx;
}

.local-card {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.city-badge {
    background: linear-gradient(135deg, #FFB347, #FFCC80);
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
}

.city-name {
    font-size: 24rpx;
    color: #FFFFFF;
    font-weight: 600;
}

.operator-logo {
    padding: 8rpx 16rpx;
    border-radius: 8rpx;

    &.中国移动 {
        background: #E85D04;
    }

    &.中国联通 {
        background: #6B21A8;
    }

    &.中国电信 {
        background: #E4002B;
    }

    &.中国广电 {
        background: #FF6B00;
    }
}

.operator-text {
    font-size: 20rpx;
    color: #FFFFFF;
    font-weight: bold;
}

.card-body {
    margin-bottom: 16rpx;
}

.card-title {
    font-size: 30rpx;
    color: #1A1A2E;
    font-weight: 600;
    display: block;
    margin-bottom: 12rpx;
}

.data-display {
    display: inline-flex;
    align-items: baseline;
    margin-bottom: 8rpx;
}

.data-amount {
    font-size: 56rpx;
    font-weight: 900;
    color: #4A9FF5;
    line-height: 1;
}

.data-unit {
    font-size: 28rpx;
    color: #4A9FF5;
    font-weight: 600;
    margin-left: 4rpx;
}

.card-price {
    font-size: 28rpx;
    color: #E85D04;
    font-weight: bold;
    display: block;
}

.card-features {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.feature-tag {
    font-size: 22rpx;
    color: #2D9D78;
    background: #EDF8F4;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
}

.card-action {
    display: flex;
    justify-content: flex-end;
}

.apply-btn {
    background: linear-gradient(135deg, #4A9FF5, #81C4FF);
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 600;
    padding: 16rpx 48rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(74, 159, 245, 0.3);
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
}

.empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}

/* 底部导航栏 */
.custom-tabbar {
    width: 100%;
    height: 110rpx;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
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
