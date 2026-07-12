<script setup>
import { ref } from 'vue'

// 常见问题
const faqList = ref([
    {
        question: '如何激活号卡？',
        answer: '您收到号卡后，可通过以下方式激活：1. 扫描号卡上的二维码；2. 拨打运营商激活热线；3. 在运营商APP中自助激活。'
    },
    {
        question: '号卡多久能送到？',
        answer: '一般情况下，号卡会在下单后1-3个工作日内送达。您可以在订单查询中查看物流信息。'
    },
    {
        question: '可以异地使用吗？',
        answer: '大部分号卡支持全国使用，但部分本地号卡可能有地域限制，请在办理前仔细阅读套餐说明。'
    },
    {
        question: '如何注销号卡？',
        answer: '您可以携带身份证到运营商营业厅办理注销，或拨打运营商客服热线咨询线上注销流程。'
    }
])

const showFaqIndex = ref(-1)

// 客服信息
const contactInfo = ref({
    phone: '18094782253',
    wechat: '18094782253',
    serviceHours: '9:00-21:00'
})

function toggleFaq(index) {
    showFaqIndex.value = showFaqIndex.value === index ? -1 : index
}

function makePhoneCall() {
    uni.makePhoneCall({
        phoneNumber: contactInfo.value.phone,
        fail: () => {
            uni.showToast({
                title: '拨打失败',
                icon: 'none'
            })
        }
    })
}

// 复制微信号并提示去微信搜索
function copyWechat() {
    const wechat = contactInfo.value.wechat
    // 复制到剪贴板
    uni.setClipboardData({
        data: wechat,
        success: () => {
            uni.showModal({
                title: '复制成功',
                content: `微信号 ${wechat} 已复制\n\n请打开微信 → 顶部搜索框 → 粘贴搜索 添加客服`,
                showCancel: false,
                confirmText: '我知道了',
                success: (res) => {
                    if (res.confirm) {
                        // 尝试唤起微信（仅在小程序环境生效）
                        // #ifdef MP-WEIXIN
                        uni.openChatPanel &&
                            uni.openChatPanel({
                                openId: '',
                                success: () => { },
                                fail: () => {
                                    // 唤起失败不做处理
                                }
                            })
                        // #endif
                    }
                }
            })
        },
        fail: () => {
            uni.showToast({
                title: '复制失败，请手动复制',
                icon: 'none'
            })
        }
    })
}
</script>

<template>
    <view class="page">
        <!-- 顶部背景 -->
        <view class="header-bg">
            <view class="header-content">
                <text class="page-title">在线客服</text>
                <text class="page-subtitle">我们随时为您服务</text>
            </view>
        </view>

        <scroll-view scroll-y class="main-content">
            <!-- 客服卡片 -->
            <view class="service-card">
                <view class="service-header">
                    <uni-icons class="service-icon" type="headphones" size="44rpx" color="#5B8DEF" />
                    <text class="service-title">客服中心</text>
                </view>

                <view class="contact-methods">
                    <view class="contact-item" @click="makePhoneCall">
                        <view class="contact-icon phone">
                            <uni-icons type="phone-filled" size="32rpx" color="#FFFFFF" />
                        </view>
                        <view class="contact-info">
                            <text class="contact-label">客服热线</text>
                            <text class="contact-value">{{ contactInfo.phone }}</text>
                        </view>
                        <uni-icons class="contact-arrow" type="forward" size="32rpx" color="#CCCCCC" />
                    </view>

                    <view class="contact-item" @click="copyWechat">
                        <view class="contact-icon wechat">
                            <uni-icons type="weixin" size="32rpx" color="#FFFFFF" />
                        </view>
                        <view class="contact-info">
                            <text class="contact-label">微信客服</text>
                            <text class="contact-value">{{ contactInfo.wechat }}</text>
                        </view>
                        <uni-icons class="contact-arrow" type="forward" size="32rpx" color="#CCCCCC" />
                    </view>

                    <view class="contact-item">
                        <view class="contact-icon hours">
                            <uni-icons type="calendar-filled" size="32rpx" color="#FFFFFF" />
                        </view>
                        <view class="contact-info">
                            <text class="contact-label">服务时间</text>
                            <text class="contact-value">{{ contactInfo.serviceHours }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 常见问题 -->
            <view class="faq-section">
                <view class="section-header">
                    <text class="section-title">常见问题</text>
                </view>

                <view class="faq-list">
                    <view class="faq-item" v-for="(faq, index) in faqList" :key="index" @click="toggleFaq(index)">
                        <view class="faq-question">
                            <text class="question-text">{{ faq.question }}</text>
                            <view class="question-arrow" :class="{ expanded: showFaqIndex === index }">
                                <uni-icons type="forward" size="28rpx" color="#999999" />
                            </view>
                        </view>
                        <view class="faq-answer" v-if="showFaqIndex === index">
                            <text class="answer-text">{{ faq.answer }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 意见反馈 -->
            <view class="feedback-section">
                <view class="section-header">
                    <text class="section-title">意见反馈</text>
                </view>

                <view class="feedback-card">
                    <textarea class="feedback-input" placeholder="请描述您的问题或建议..." />
                    <view class="feedback-btn">提交反馈</view>
                </view>
            </view>

            <!-- 底部占位 -->
            <view class="bottom-placeholder"></view>
        </scroll-view>

        <!-- 底部导航栏 -->
        <tab-bar :current="3" />
    </view>
</template>


<style lang="scss" scoped>
.page {
    background: #F5F6FA;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header-bg {
    background: $brand-gradient;
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

/* 主内容区 */
.main-content {
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 24rpx;
}

/* 客服卡片 */
.service-card {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.service-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #F0F2F5;
}

.service-icon {
    font-size: 44rpx;
}

.service-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1A1A2E;
}

.contact-methods {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx;
    background: #F5F6FA;
    border-radius: 12rpx;
}

.contact-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.phone {
        background: $brand-gradient;
    }

    &.wechat {
        background: $wechat-gradient;
    }

    &.hours {
        background: $orange-gradient;
    }
}

.icon-text {
    font-size: 32rpx;
}

.contact-info {
    flex: 1;
}

.contact-label {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.contact-value {
    font-size: 28rpx;
    color: #1A1A2E;
    font-weight: 600;
    display: block;
    margin-top: 4rpx;
}

.contact-arrow {
    font-size: 36rpx;
    color: #CCC;
}

/* 常见问题 */
.faq-section {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.section-header {
    margin-bottom: 20rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1A1A2E;
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.faq-item {
    border: 1rpx solid #F0F2F5;
    border-radius: 12rpx;
    overflow: hidden;
}

.faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #F5F6FA;
}

.question-text {
    font-size: 26rpx;
    color: #1A1A2E;
    font-weight: 500;
    flex: 1;
}

.question-arrow {
    font-size: 32rpx;
    color: #999;
    transition: transform 0.3s;

    &.expanded {
        transform: rotate(90deg);
    }
}

.faq-answer {
    padding: 20rpx;
    background: #FFFFFF;
}

.answer-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
}

/* 意见反馈 */
.feedback-section {
    background: #FFFFFF;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.feedback-card {
    margin-top: 16rpx;
}

.feedback-input {
    width: 100%;
    height: 200rpx;
    background: #F5F6FA;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
    color: #1A1A2E;
    box-sizing: border-box;
}

.feedback-btn {
    margin-top: 20rpx;
    background: $brand-gradient;
    color: #FFFFFF;
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;
    padding: 20rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(91, 141, 239, 0.3);
}

/* 底部占位 */
.bottom-placeholder {
    height: calc(130rpx + env(safe-area-inset-bottom));
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
            color: #5B8DEF;
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
