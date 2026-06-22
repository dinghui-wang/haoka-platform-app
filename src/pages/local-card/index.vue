<script setup>
import { ref } from 'vue'
import { regionData } from '@/utils/regionData.js'

const currentTabbar = ref(2)

// 归属地选择
const regionValue = ref('')

// 归属地变更
function onRegionChange(e) {
    console.log('选择归属地:', e)
}

// 筛选标签
const filterTags = ref([
    { text: '可选号', active: true },
    { text: '长期20年', active: false },
    { text: '共享热点', active: false },
    { text: '可开副卡', active: false },
    { text: '超大流量', active: false },
    { text: '19元月租', active: false }
])
const deliveryTag = ref({ text: '选择可收货地区', active: false })

// 本地号卡数据
const localCards = ref([
    {
        id: 1,
        operator: '联通',
        operatorFull: '中国联通',
        title: '联通本地卡39元50G流量+100分钟【发全国】',
        data: '50',
        dataSub: '20G通用流量+30G定向流量',
        price: '39',
        tag1: '收货地即归属地',
        tag2: '18-60岁可申请',
        desc: '本地归属，上门激活，京东快递，顺丰快递...',
        soldCount: 64768,
        color: '#E84545'
    },
    {
        id: 2,
        operator: 'GV联通',
        operatorFull: '中国联通',
        title: 'GY联通本地卡39元50G流量+100分钟【发全国】',
        data: '50',
        dataSub: '20G通用流量+30G定向流量',
        price: '39',
        tag1: '收货地即归属地',
        tag2: '18-60岁可申请',
        desc: '本地归属，上门激活，京东快递，顺丰快递...',
        soldCount: 31634,
        color: '#E84545'
    },
    {
        id: 3,
        operator: 'MF联通',
        operatorFull: '中国联通',
        title: 'MF联通本地卡39元50G流量+100分钟【发全国】',
        data: '50',
        dataSub: '20G通用流量+30G定向流量',
        price: '39',
        tag1: '收货地即归属地',
        tag2: '18-60岁可申请',
        desc: '本地归属，上门激活，京东快递，顺丰快递...',
        soldCount: 44551,
        color: '#E84545'
    }
])

// 切换筛选标签
function toggleFilterTag(index) {
    filterTags.value[index].active = !filterTags.value[index].active
}

// 切换收货地区标签
function toggleDeliveryTag() {
    deliveryTag.value.active = !deliveryTag.value.active
}

// 免费领取
function onApply(card) {
    console.log('领取套餐:', card.title)
    // TODO: 跳转到订单填写页面
}

// 格式化销量
function formatSoldCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万+'
    }
    return count.toString()
}
</script>

<template>
    <view class="page">
        <!-- 归属地选择区域 -->
        <view class="region-selector">
            <view class="region-label">
                <text class="location-icon">📍</text>
                <text class="label-text">归属地</text>
                <text class="required">*</text>
            </view>
            <uni-data-picker v-model="regionValue" :localdata="regionData" :clear-icon="false" placeholder="请选择"
                popup-title="选择归属地" @change="onRegionChange" />
        </view>

        <!-- 筛选标签区域 -->
        <view class="filter-section">
            <view class="filter-tags">
                <view class="filter-tag" v-for="(tag, index) in filterTags" :key="index" :class="{ active: tag.active }"
                    @click="toggleFilterTag(index)">
                    <text>{{ tag.text }}</text>
                </view>
            </view>
            <view class="delivery-tag" :class="{ active: deliveryTag.active }" @click="toggleDeliveryTag">
                <text>{{ deliveryTag.text }}</text>
            </view>
        </view>

        <!-- 号卡列表 -->
        <scroll-view scroll-y class="card-list">
            <view class="card-wrapper">
                <view class="local-card" v-for="card in localCards" :key="card.id">
                    <!-- 左侧运营商信息和价格 -->
                    <view class="card-left">
                        <view class="operator-badge" :style="{ background: card.color }">
                            <text class="operator-name">{{ card.operatorFull }}</text>
                            <text class="operator-type">{{ card.operator }}本地卡</text>
                        </view>
                        <view class="data-info">
                            <text class="data-amount">{{ card.data }}<text class="data-unit">G</text></text>
                        </view>
                        <view class="price-row">
                            <text class="price-num">{{ card.price }}</text>
                            <text class="price-unit">元/月</text>
                            <text class="local-tag">本地归属</text>
                        </view>
                        <text class="data-sub">{{ card.dataSub }}</text>
                    </view>

                    <!-- 右侧详情和操作 -->
                    <view class="card-right">
                        <text class="card-title">{{ card.title }}</text>

                        <view class="tags-row">
                            <text class="tag-orange">{{ card.tag1 }}</text>
                            <text class="tag-green">{{ card.tag2 }}</text>
                        </view>

                        <text class="card-desc">{{ card.desc }}</text>

                        <view class="bottom-row">
                            <view class="sold-info">
                                <text class="fire-icon">🔥</text>
                                <text class="sold-text">已领取{{ formatSoldCount(card.soldCount) }}件</text>
                            </view>
                            <view class="apply-btn" @click="onApply(card)">
                                <text>免费领取</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部导航栏 -->
        <view class="custom-tabbar">
            <view class="tabbar-item" :class="{ active: currentTabbar === 0 }"
                @click="$router.push('/pages/index/index')">
                <text class="tabbar-icon">🏠</text>
                <text class="tabbar-text">店铺首页</text>
            </view>
            <view class="tabbar-item" :class="{ active: currentTabbar === 1 }"
                @click="$router.push('/pages/order/index')">
                <text class="tabbar-icon">📋</text>
                <text class="tabbar-text">订单查询</text>
            </view>
            <view class="tabbar-item" :class="{ active: currentTabbar === 2 }">
                <text class="tabbar-icon">👤</text>
                <text class="tabbar-text">北京号卡</text>
            </view>
            <view class="tabbar-item" :class="{ active: currentTabbar === 3 }"
                @click="$router.push('/pages/customer-service/index')">
                <text class="tabbar-icon">🎧</text>
                <text class="tabbar-text">在线客服</text>
            </view>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.page {
    max-width: 550px;
    margin: 0 auto;
    background: #F5F6FA;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* 归属地选择器 */
.region-selector {
    background: #FFFFFF;
    padding: 24rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #F0F0F0;
}

.region-label {
    display: flex;
    align-items: center;
    gap: 6rpx;

    .location-icon {
        font-size: 32rpx;
    }

    .label-text {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
    }

    .required {
        color: #FF4D4F;
        font-size: 28rpx;
    }
}

.region-value {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .region-text {
        font-size: 28rpx;
        color: #333;
    }

    .arrow {
        font-size: 26rpx;
        color: #999;
    }
}

/* 筛选标签 */
.filter-section {
    background: #FFFFFF;
    padding: 24rpx 30rpx;
    margin-bottom: 16rpx;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.filter-tag,
.delivery-tag {
    padding: 14rpx 28rpx;
    border-radius: 36rpx;
    border: 2rpx solid #4A9FF5;
    background: #FFFFFF;

    text {
        font-size: 26rpx;
        color: #4A9FF5;
    }

    &.active {
        background: rgba(74, 159, 245, 0.12);

        text {
            color: #1890FF;
            font-weight: 500;
        }
    }
}

.delivery-tag {
    margin-top: 16rpx;
}

/* 号卡列表 */
.card-list {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    padding: 0 20rpx 140rpx;
    overflow-x: hidden;
}

.card-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.local-card {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    display: flex;
    gap: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
    overflow: hidden;
}

/* 左侧区域 */
.card-left {
    width: 160rpx;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}

.operator-badge {
    width: 160rpx;
    height: 80rpx;
    border-radius: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;

    .operator-name {
        font-size: 18rpx;
        color: #FFF;
        font-weight: bold;
    }

    .operator-type {
        font-size: 16rpx;
        color: rgba(255, 255, 255, 0.9);
    }
}

.data-info {
    margin-bottom: 8rpx;

    .data-amount {
        font-size: 64rpx;
        font-weight: 900;
        color: #333;
        line-height: 1;

        .data-unit {
            font-size: 32rpx;
            font-weight: 700;
        }
    }
}

.price-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4rpx;
    margin-bottom: 6rpx;

    .price-num {
        font-size: 36rpx;
        font-weight: 700;
        color: #E84545;
    }

    .price-unit {
        font-size: 20rpx;
        color: #E84545;
    }

    .local-tag {
        font-size: 18rpx;
        color: #E84545;
        background: rgba(232, 69, 69, 0.1);
        padding: 2rpx 8rpx;
        border-radius: 4rpx;
        margin-left: 4rpx;
    }
}

.data-sub {
    font-size: 18rpx;
    color: #999;
    text-align: center;
    word-break: break-all;
    line-height: 1.3;
}

/* 右侧区域 */
.card-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.card-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 12rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.tags-row {
    display: flex;
    gap: 12rpx;
    margin-bottom: 12rpx;
}

.tag-orange {
    font-size: 22rpx;
    color: #FA8C16;
    background: rgba(250, 140, 22, 0.1);
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
}

.tag-green {
    font-size: 22rpx;
    color: #52C41A;
    background: rgba(82, 196, 26, 0.1);
    padding: 6rpx 14rpx;
    border-radius: 6rpx;
}

.card-desc {
    font-size: 24rpx;
    color: #999;
    line-height: 1.5;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.sold-info {
    display: flex;
    align-items: center;
    gap: 6rpx;

    .fire-icon {
        font-size: 26rpx;
    }

    .sold-text {
        font-size: 24rpx;
        color: #999;
    }
}

.apply-btn {
    background: linear-gradient(135deg, #4A9FF5, #81C4FF);
    padding: 14rpx 32rpx;
    border-radius: 30rpx;

    text {
        font-size: 26rpx;
        color: #FFFFFF;
        font-weight: 600;
    }
}

/* 底部导航栏 */
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
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.tabbar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx 20rpx;

    &.active {
        .tabbar-text {
            color: #4A9FF5;
            font-weight: 600;
        }
    }
}

.tabbar-icon {
    font-size: 40rpx;
}

.tabbar-text {
    font-size: 22rpx;
    color: #999;
}
</style>
