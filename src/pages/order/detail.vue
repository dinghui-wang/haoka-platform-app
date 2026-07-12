<script setup>
import { ref, onMounted, computed } from 'vue'
import { decodeOrderFromUrl } from '@/api/order.js'

// 顶部搜索（只显示用，不发请求）
const phone = ref('')

// 详情数据：从 URL 参数解码得到，不发任何接口请求
const detail = ref(null)

onMounted(() => {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1]
    const opts = cur?.$page?.options || {}

    phone.value = opts.phone ? decodeURIComponent(opts.phone) : ''

    // 解码订单对象
    detail.value = decodeOrderFromUrl(opts.data)
})

// 状态徽章背景色
const statusBg = computed(() => {
    if (!detail.value?.statusColor) return '#F5F6FA'
    return detail.value.statusColor + '18'
})

function copyText(text) {
    if (!text) return
    uni.setClipboardData({
        data: String(text),
        success: () => uni.showToast({ title: '已复制', icon: 'none' }),
    })
}

// 返回列表
function goBack() {
    uni.navigateBack({ delta: 1 })
}
</script>

<template>
    <view class="detail-page">
        <!-- ====== 顶栏 ====== -->
        <view class="top-bar">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">‹</text>
            </view>
            <view class="top-title">订单详情</view>
            <view class="top-spacer"></view>
        </view>

        <!-- 详情主体 -->
        <scroll-view v-if="detail" scroll-y class="main-body" :show-scrollbar="false">
            <!-- 产品卡片 -->
            <view class="product-card">
                <view class="pc-icon-wrap">
                    <text class="pc-icon">📶</text>
                </view>
                <view class="pc-right">
                    <text class="pc-name">{{ detail.productName }}</text>
                    <view class="pc-tags" v-if="detail.phoneNum">
                        <text class="pc-tag">号卡：{{ detail.phoneNum }}</text>
                    </view>
                </view>
            </view>

            <!-- 订单信息 -->
            <view class="info-section">
                <view class="sec-title"><text>订单信息</text></view>
                <view class="info-list">
                    <view class="info-row">
                        <text class="info-label">订单编号</text>
                        <view class="info-value-wrap" @click.stop="copyText(detail.orderNo)">
                            <text class="info-value mono">{{ detail.orderNo }}</text>
                            <text class="copy-btn">复制</text>
                        </view>
                    </view>
                    <view class="info-row">
                        <text class="info-label">订单状态</text>
                        <view class="status-badge" :style="{ color: detail.statusColor, background: statusBg }">
                            {{ detail.statusText }}
                        </view>
                    </view>
                    <view class="info-row">
                        <text class="info-label">下单时间</text>
                        <text class="info-value">{{ detail.createTime }}</text>
                    </view>
                </view>
            </view>

            <!-- 收货人信息 -->
            <view class="info-section" v-if="detail.receiverName || detail.address">
                <view class="sec-title"><text>收货人信息</text></view>
                <view class="info-list">
                    <view class="info-row" v-if="detail.receiverName">
                        <text class="info-label">收货人</text>
                        <text class="info-value">{{ detail.receiverName }}　{{ detail.receiverPhone }}</text>
                    </view>
                    <view class="info-row" v-if="detail.receiverIdCard">
                        <text class="info-label">身份证</text>
                        <text class="info-value mono">{{ detail.receiverIdCard }}</text>
                    </view>
                    <view class="info-row" v-if="detail.phone">
                        <text class="info-label">查询号码</text>
                        <text class="info-value mono">{{ detail.phone }}</text>
                    </view>
                    <view class="info-row" v-if="detail.address">
                        <text class="info-label">收货地址</text>
                        <text class="info-value addr">{{ detail.region }} {{ detail.address }}</text>
                    </view>
                </view>
            </view>

            <!-- 号卡信息 -->
            <view class="info-section" v-if="detail.phoneNum || detail.iccid">
                <view class="sec-title"><text>号卡信息</text></view>
                <view class="info-list">
                    <view class="info-row" v-if="detail.phoneNum">
                        <text class="info-label">号卡号码</text>
                        <view class="info-value-wrap" @click.stop="copyText(detail.phoneNum)">
                            <text class="info-value mono">{{ detail.phoneNum }}</text>
                            <text class="copy-btn">复制</text>
                        </view>
                    </view>
                    <view class="info-row" v-if="detail.iccid">
                        <text class="info-label">ICCID</text>
                        <text class="info-value mono">{{ detail.iccid }}</text>
                    </view>
                </view>
            </view>

            <!-- 物流信息 -->
            <view class="info-section" v-if="detail.logisticsCompany || detail.trackingNo || detail.shippedAt">
                <view class="sec-title"><text>物流信息</text></view>
                <view class="info-list">
                    <view class="info-row" v-if="detail.logisticsCompany">
                        <text class="info-label">物流公司</text>
                        <text class="info-value">{{ detail.logisticsCompany }}</text>
                    </view>
                    <view class="info-row" v-if="detail.trackingNo">
                        <text class="info-label">物流单号</text>
                        <view class="info-value-wrap" @click.stop="copyText(detail.trackingNo)">
                            <text class="info-value mono">{{ detail.trackingNo }}</text>
                            <text class="copy-btn">复制</text>
                        </view>
                    </view>
                    <view class="info-row" v-if="detail.shippedAt">
                        <text class="info-label">发货时间</text>
                        <text class="info-value">{{ detail.shippedAt }}</text>
                    </view>
                </view>
            </view>

            <!-- 首充信息 -->
            <view class="info-section" v-if="detail.firstRechargeAt || detail.firstRechargeAmount > 0">
                <view class="sec-title"><text>首充信息</text></view>
                <view class="info-list">
                    <view class="info-row" v-if="detail.firstRechargeAt">
                        <text class="info-label">首充时间</text>
                        <text class="info-value">{{ detail.firstRechargeAt }}</text>
                    </view>
                    <view class="info-row" v-if="detail.firstRechargeAmount > 0">
                        <text class="info-label">首充金额</text>
                        <text class="info-value">¥{{ detail.firstRechargeAmount }}</text>
                    </view>
                </view>
            </view>

            <!-- 其他信息 -->
            <view class="info-section" v-if="detail.completedAt || detail.cancelReason || detail.remark">
                <view class="sec-title"><text>其他信息</text></view>
                <view class="info-list">
                    <view class="info-row" v-if="detail.completedAt">
                        <text class="info-label">完成时间</text>
                        <text class="info-value">{{ detail.completedAt }}</text>
                    </view>
                    <view class="info-row" v-if="detail.cancelReason">
                        <text class="info-label">取消原因</text>
                        <text class="info-value cancel">{{ detail.cancelReason }}</text>
                    </view>
                    <view class="info-row" v-if="detail.remark">
                        <text class="info-label">备注</text>
                        <text class="info-value">{{ detail.remark }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 无数据 -->
        <view v-else class="empty-area">
            <text class="ea-icon">😕</text>
            <text class="ea-text">订单详情不存在</text>
            <text class="ea-tip">请从订单列表重新进入</text>
            <button class="ea-btn" @click="goBack">返回列表</button>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.detail-page {
    min-height: 100vh;
    background: #F2F4F8;
}

/* ====== 顶栏 ====== */
.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 16rpx;
    background: #FFFFFF;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.back-icon {
    font-size: 48rpx;
    color: #333;
    font-weight: 600;
    line-height: 1;
}

.top-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #1A1A2E;
    flex: 1;
    text-align: center;
}

.top-spacer {
    width: 60rpx;
    flex-shrink: 0;
}

/* ====== 主体滚动 ====== */
.main-body {
    box-sizing: border-box;
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

.pc-icon-wrap {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #EDF2FF, #E8EBFF);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.pc-icon {
    font-size: 44rpx;
    opacity: 0.7;
}

.pc-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10rpx;
    min-width: 0;
}

.pc-name {
    font-size: 28rpx;
    font-weight: 700;
    color: #1A1A2E;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.pc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.pc-tag {
    font-size: 20rpx;
    padding: 3rpx 12rpx;
    border-radius: 6rpx;
    background: #EDF2FF;
    color: #5B8DEF;
    font-weight: 600;
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
}

.info-label {
    font-size: 25rpx;
    color: #888;
    flex-shrink: 0;
    width: 150rpx;
    line-height: 1.5;
}

.info-value-wrap {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex: 1;
    justify-content: flex-end;
}

.info-value {
    font-size: 25rpx;
    color: #333;
    text-align: right;
    word-break: break-all;
    flex: 1;

    &.mono {
        font-family: monospace;
        letter-spacing: 0.5rpx;
    }

    &.addr {
        line-height: 1.5;
    }

    &.cancel {
        color: #E86A17;
    }
}

.copy-btn {
    font-size: 20rpx;
    color: #5B8DEF;
    background: #EDF2FF;
    padding: 2rpx 10rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
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
    padding: 160rpx 40rpx;
    gap: 16rpx;
}

.ea-icon {
    font-size: 90rpx;
}

.ea-text {
    font-size: 28rpx;
    color: #999;
}

.ea-tip {
    font-size: 24rpx;
    color: #CCC;
    margin-bottom: 16rpx;
}

.ea-btn {
    margin-top: 16rpx;
    padding: 0 40rpx;
    height: 72rpx;
    line-height: 72rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #5B8DEF, #7B68EE);
    border-radius: 36rpx;
    border: none;

    &:active {
        opacity: 0.85;
        transform: scale(0.97);
    }
}
</style>
