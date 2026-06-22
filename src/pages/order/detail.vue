<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const orderId = ref('')
const phone = ref('')
const loading = ref(true)
const detail = ref(null)

// 顶部搜索
const topPhone = ref('')

onMounted(() => {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1]
    if (cur?.$page?.options) {
        orderId.value = cur.$page.options.id || ''
        phone.value = cur.$page.options.phone || ''
        topPhone.value = phone.value
    }
    fetchDetail()
})

async function fetchDetail() {
    loading.value = true
    try {
        const res = await request.post('/api/order/detail', { order_id: orderId.value, phone: phone.value })
        let data = res
        if (res?.data) data = res.data
        detail.value = data ? transformDetail(data) : null
    } catch (e) {
        console.error('获取详情失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
        loading.value = false
    }
}

function transformDetail(item) {
    const status = item.status || item.order_status || '未知'
    const d = item.detail || {}
    return {
        id: item.order_no || item.id || '',
        productName: item.product_name || item.name || '',
        mainImage: item.main_image || '',
        operator: item.carrier_name || item.operator || '',
        price: String(item.price || d.current_monthly || 0),
        status,
        statusColor: getStatusColor(status),
        statusBg: getStatusBg(status),
        createTime: item.create_time || item.created_at || '',
        consignee: item.consignee || item.name || '',
        idCard: maskCard(item.id_card || ''),
        mobile: maskMobile(item.mobile || ''),
        address: maskAddress(item.address || ''),
        trackingNo: item.tracking_no || '',
        logisticsName: item.logistics_name || item.express_company || '',
        specs: {
            traffic: d.general_traffic,
            directedTraffic: d.directed_traffic,
            voice: d.voice_minutes,
        },
    }
}

function getStatusColor(s) {
    const m = { '已发货': '#2D9D78', '已完成': '#2D9D78', '已激活': '#2D9D78', '待发货': '#E86A17', '待付款': '#E86A17' }
    return m[s] || '#666'
}
function getStatusBg(s) {
    const m = { '已发货': '#EDF8F4', '已完成': '#EDF8F4', '已激活': '#EDF8F4', '待发货': '#FFF5EC', '待付款': '#FFF5EC' }
    return m[s] || '#F5F5FA'
}

function maskCard(v) { if (!v || v.length < 7) return v; return v.substring(0, 3) + '*'.repeat(Math.min(12, v.length - 6)) + v.slice(-4) }
function maskMobile(v) { if (!v || v.length < 11) return v; return v.substring(0, 3) + '****' + v.slice(-4) }
function maskAddress(v) { if (!v) return ''; if (v.length <= 6) return v; return v.substring(0, v.length - 3) + '***' }

// 重新搜索
function reSearch() {
    if (!topPhone.value) return
    uni.redirectTo({ url: `/pages/order/index?phone=${topPhone.value}` })
}
</script>

<template>
    <view class="detail-page">
        <!-- ====== 顶栏搜索区 ====== -->
        <view class="top-bar">
            <view class="search-box">
                <text class="sb-icon">📱</text>
                <input class="sb-input" type="number" :value="phone" placeholder="输入手机号查询" placeholder-class="sb-ph"
                    maxlength="11" />
                <text v-if="phone" class="sb-clear" @click="reSearch">✕</text>
            </view>
            <button class="sb-btn" @click="reSearch">立即查询</button>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-area">
            <text class="loading-spin"></text>
            <text class="loading-text">加载中...</text>
        </view>

        <!-- 详情主体 -->
        <scroll-view v-else-if="detail" scroll-y class="main-body" :show-scrollbar="false">
            <!-- 产品卡片 -->
            <view class="product-card">
                <image v-if="detail.mainImage" class="pc-img" :src="detail.mainImage" mode="aspectFill" lazy-load />
                <view v-else class="pc-placeholder">
                    <text class="pc-ph-icon">📶</text>
                </view>
                <view class="pc-right">
                    <text class="pc-name">{{ detail.productName }}</text>
                    <view class="pc-specs">
                        <text v-if="detail.specs.traffic" class="pc-sp-item">{{ detail.specs.traffic }}G通用</text>
                        <text v-if="detail.specs.directedTraffic" class="pc-sp-item">{{ detail.specs.directedTraffic
                        }}G定向</text>
                        <text v-if="detail.specs.voice" class="pc-sp-item">{{ detail.specs.voice }}分钟</text>
                    </view>
                </view>
            </view>

            <!-- 订单信息 -->
            <view class="info-section">
                <view class="sec-title"><text>订单信息</text></view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">订单编号</text>
                        <text class="info-value mono">{{ detail.id }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">下单时间</text>
                        <text class="info-value">{{ detail.createTime }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">办卡人</text>
                        <text class="info-value">{{ detail.consignee }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">证件号码</text>
                        <text class="info-value mono">{{ detail.idCard }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">手机号码</text>
                        <text class="info-value mono">{{ detail.mobile }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">收货地址</text>
                        <text class="info-value addr">{{ detail.address }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">选购号码</text>
                        <text class="info-value mono">{{ detail.trackingNo || '—' }}</text>
                    </view>
                    <view class="info-row highlight">
                        <text class="info-label">订单状态</text>
                        <view class="status-badge" :style="{ color: detail.statusColor, background: detail.statusBg }">
                            <text>{{ detail.status }}</text>
                        </view>
                    </view>
                    <view class="info-row" v-if="detail.logisticsName">
                        <text class="info-label">物流名称</text>
                        <text class="info-value">{{ detail.logisticsName }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 无数据 -->
        <view v-else class="empty-area">
            <text class="ea-icon">😕</text>
            <text class="ea-text">订单详情不存在</text>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.detail-page {
    min-height: 100vh;
    max-width: 550px;
    margin: 0 auto;
    background: #F2F4F8;
}

/* ====== 顶栏 ====== */
.top-bar {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    background: #FFFFFF;
}

.search-box {
    flex: 1;
    display: flex;
    align-items: center;
    height: 72rpx;
    background: #F5F6FA;
    border-radius: 36rpx;
    padding: 0 20rpx;
    gap: 10rpx;
}

.sb-icon {
    font-size: 26rpx;
    flex-shrink: 0;
}

.sb-input {
    flex: 1;
    font-size: 26rpx;
    color: #333;
    height: 72rpx;
}

.sb-ph {
    color: #CCC;
    font-size: 24rpx;
}

.sb-clear {
    font-size: 22rpx;
    color: #AAA;
    padding: 6rpx;
    flex-shrink: 0;
}

.sb-btn {
    height: 68rpx;
    line-height: 68rpx;
    padding: 0 28rpx;
    font-size: 25rpx;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #5B8DEF, #7B68EE);
    border-radius: 34rpx;
    border: none;
    white-space: nowrap;

    &:active {
        opacity: .85;
        transform: scale(.97);
    }
}

/* 加载 */
.loading-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    padding: 160rpx 0;
}

.loading-text {
    font-size: 26rpx;
    color: #999;
}

/* ====== 主体滚动 ====== */
.main-body {
    padding: 20rpx 24rpx 60rpx;
}

/* 产品卡片 */
.product-card {
    display: flex;
    gap: 20rpx;
    background: #FFFFFF;
    border-radius: 18rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .04);
}

.pc-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 14rpx;
    background: #F5F6FA;
    flex-shrink: 0;
}

.pc-placeholder {
    width: 160rpx;
    height: 160rpx;
    border-radius: 14rpx;
    background: linear-gradient(145deg, #EEF1FF, #E6E9FF);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.pc-ph-icon {
    font-size: 56rpx;
    opacity: .45;
}

.pc-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12rpx;
}

.pc-name {
    font-size: 28rpx;
    font-weight: 700;
    color: #1A1A2E;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pc-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.pc-sp-item {
    font-size: 21rpx;
    color: #777;
    background: #F5F6FA;
    padding: 4rpx 14rpx;
    border-radius: 8rpx;
}

/* 信息区块 */
.info-section {
    margin-top: 20rpx;
    background: #FFFFFF;
    border-radius: 18rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .04);
    overflow: hidden;
}

.sec-title {
    padding: 24rpx 28rpx 16rpx;
    border-bottom: 1rpx solid #F2F3F7;

    text {
        font-size: 27rpx;
        font-weight: 700;
        color: #1A1A2E;
        position: relative;
        padding-left: 18rpx;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 6rpx;
            height: 26rpx;
            background: linear-gradient(180deg, #5B8DEF, #7B68EE);
            border-radius: 3rpx;
        }
    }
}

.info-list {
    padding: 8rpx 28rpx 24rpx;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16rpx 0;
    border-bottom: 1rpx dashed #F0F1F5;

    &:last-child {
        border-bottom: none;
    }

    &.highlight {
        background: none;
    }
}

.info-label {
    font-size: 25rpx;
    color: #888;
    flex-shrink: 0;
    width: 150rpx;
}

.info-value {
    font-size: 25rpx;
    color: #333;
    text-align: right;
    word-break: break-all;
    flex: 1;

    &.mono {
        font-family: monospace;
        letter-spacing: .5rpx;
    }

    &.addr {
        line-height: 1.5;
    }
}

.status-badge {
    padding: 4rpx 18rpx;
    border-radius: 8rpx;
    font-weight: 600;
    font-size: 25rpx;
}

/* 空状态 */
.empty-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 160rpx 0;
    gap: 16rpx;
}

.ea-icon {
    font-size: 90rpx;
}

.ea-text {
    font-size: 28rpx;
    color: #999;
}
</style>
