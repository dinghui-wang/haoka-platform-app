<script setup>
import { ref } from 'vue'

const currentTabbar = ref(1)

// 订单列表数据
const orders = ref([
    {
        id: '202406090001',
        productName: '联通随心卡29元150G+200分钟',
        operator: '中国联通',
        status: '已激活',
        statusColor: '#2D9D78',
        price: '29',
        createTime: '2024-06-09 14:30'
    },
    {
        id: '202406080002',
        productName: '移动超值卡29元135G',
        operator: '中国移动',
        status: '待发货',
        statusColor: '#E86A17',
        price: '29',
        createTime: '2024-06-08 10:20'
    }
])

const orderTabs = ref(['全部', '待付款', '待发货', '已发货', '已完成'])
const currentOrderTab = ref(0)
</script>

<template>
    <view class="page">
        <!-- 顶部背景 -->
        <view class="header-bg">
            <view class="header-content">
                <text class="page-title">订单查询</text>
                <text class="page-subtitle">查看您的订单状态</text>
            </view>
        </view>

        <!-- 订单标签页 -->
        <view class="order-tabs">
            <view class="tab-item" v-for="(tab, index) in orderTabs" :key="index"
                :class="{ active: currentOrderTab === index }" @click="currentOrderTab = index">
                <text class="tab-text">{{ tab }}</text>
            </view>
        </view>

        <!-- 订单列表 -->
        <scroll-view scroll-y class="order-list">
            <view class="order-card" v-for="(order, index) in orders" :key="index">
                <view class="order-header">
                    <text class="order-id">订单号：{{ order.id }}</text>
                    <text class="order-status" :style="{ color: order.statusColor }">{{ order.status }}</text>
                </view>

                <view class="order-body">
                    <view class="order-product">
                        <view class="product-icon">
                            <text class="icon-text">📱</text>
                        </view>
                        <view class="product-info">
                            <text class="product-name">{{ order.productName }}</text>
                            <text class="product-operator">{{ order.operator }}</text>
                        </view>
                        <text class="product-price">¥{{ order.price }}/月</text>
                    </view>
                </view>

                <view class="order-footer">
                    <text class="order-time">下单时间：{{ order.createTime }}</text>
                    <view class="order-actions">
                        <view class="action-btn primary">查看详情</view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="orders.length === 0">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无订单</text>
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
        // 当前页面不需要跳转
      } else if (index === 2) {
        uni.redirectTo({ url: '/pages/local-card/index' })
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

/* 订单标签页 */
.order-tabs {
    display: flex;
    background: #FFFFFF;
    padding: 0 10rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow-x: auto;
    white-space: nowrap;

    &::-webkit-scrollbar {
        display: none;
    }
}

.tab-item {
    flex-shrink: 0;
    padding: 24rpx 20rpx;
    position: relative;

    &.active {
        .tab-text {
            color: #4A9FF5;
            font-weight: 600;
        }

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background: #4A9FF5;
            border-radius: 2rpx;
        }
    }
}

.tab-text {
    font-size: 26rpx;
    color: #666;
}

/* 订单列表 */
.order-list {
    flex: 1;
    padding: 24rpx;
}

.order-card {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #F0F2F5;
}

.order-id {
    font-size: 24rpx;
    color: #999;
}

.order-status {
    font-size: 26rpx;
    font-weight: 600;
}

.order-body {
    padding: 20rpx 0;
}

.order-product {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.product-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #FFEFED, #FFDAD5);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-text {
    font-size: 40rpx;
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 28rpx;
    color: #1A1A2E;
    font-weight: 600;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-operator {
    font-size: 22rpx;
    color: #999;
    margin-top: 6rpx;
    display: block;
}

.product-price {
    font-size: 30rpx;
    color: #E85D04;
    font-weight: bold;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #F0F2F5;
}

.order-time {
    font-size: 22rpx;
    color: #999;
}

.order-actions {
    display: flex;
    gap: 16rpx;
}

.action-btn {
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    font-size: 24rpx;

    &.primary {
        background: #4A9FF5;
        color: #FFFFFF;
    }

    &.default {
        background: #F5F6FA;
        color: #666;
    }
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
