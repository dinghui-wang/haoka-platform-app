<!--
  商品详情中转页（SPA 内嵌 iframe 版）
  - H5：用 <iframe> 直接嵌入最终 h5 直链（顶栏始终 bk.kahone.top，不跳走）
        说明：h5.yapingkeji.com 允许被嵌、同一主域，故直接用 iframe 最顺
  - 小程序/App：用 <web-view> 加载（这两端没有 iframe / location.href 外跳能力）
  - 接收 url = 最终 h5 直链，id = 商品 id（用于点击上报）
-->
<template>
    <view class="webview-page">
        <!-- H5 + 小程序/App 统一头部 -->
        <!-- <view class="wb-header">
      <uni-icons class="wb-back" type="back" size="36rpx" color="#FFFFFF" @click="goBack" />
      <view class="wb-title">商品详情</view>
      <uni-icons class="wb-close" type="close" size="36rpx" color="#FFFFFF" @click="goHome" />
    </view> -->

        <!-- #ifdef H5 -->
        <iframe class="wb-frame" :src="realUrl" frameborder="0" referrerpolicy="no-referrer-when-downgrade"
            @load="onIframeLoad" />
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN || APP-PLUS -->
        <web-view class="wb-frame" :src="realUrl" />
        <!-- #endif -->

        <view v-if="loading" class="wb-mask">
            <view class="wb-loading">加载中…</view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'

const realUrl = ref('')
const productId = ref('')
const loading = ref(true)

onLoad((options = {}) => {
    const u =
        options.url ||
        (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('url') : '')
    if (u) realUrl.value = u
    productId.value = options.id || ''
})

onMounted(() => {
    // #ifdef H5
    if (!realUrl.value) {
        loading.value = false
        return
    }
    // 生产环境：先上报点击到 Worker（/track，console.log），不阻塞加载
    if (import.meta.env.PROD && productId.value) {
        try {
            const img = new Image()
            img.src = `/track?id=${encodeURIComponent(productId.value)}&to=${encodeURIComponent(realUrl.value)}&_t=${Date.now()}`
        } catch (e) {
            // 上报失败不影响加载
        }
    }
    // #endif
})

function onIframeLoad() {
    loading.value = false
}

function goBack() {
    // #ifdef H5
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/'
    // #endif
    // #ifndef H5
    uni.navigateBack({ delta: 1, fail: () => uni.reLaunch({ url: '/pages/index/index' }) })
    // #endif
}

function goHome() {
    // #ifdef H5
    window.location.href = '/'
    // #endif
    // #ifndef H5
    uni.reLaunch({ url: '/pages/index/index' })
    // #endif
}

onBackPress(() => {
    goBack()
    return true
})
</script>

<style lang="scss" scoped>
.webview-page {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.wb-header {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 12rpx;
    background: $brand-gradient;
    color: #fff;
    flex: 0 0 auto;
    z-index: 10;
}

.wb-back,
.wb-close {
    width: 80rpx;
    text-align: center;
    font-size: 36rpx;
    line-height: 44px;
    cursor: pointer;
}

.wb-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.wb-frame {
    flex: 1 1 auto;
    width: 100%;
    border: 0;
    background: #fff;
}

.wb-mask {
    position: fixed;
    inset: 44px 0 0 0;
    background: rgba(255, 255, 255, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.wb-loading {
    font-size: 28rpx;
    color: #666;
}
</style>
