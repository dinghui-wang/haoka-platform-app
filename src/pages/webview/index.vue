<!--
  商品详情中转页
  - H5：显示"正在跳转"反馈，先发 /track 上报点击，随后 window.location.href 直接打开 main_link
  - 小程序/App：用 <web-view> 直接加载 main_link（这两端没有 location.href 外跳能力）
  - 接收 url = main_link 真实链接，id = 商品 id（用于点击上报）
-->
<template>
  <view class="webview-page">
    <!-- #ifdef MP-WEIXIN || APP-PLUS -->
    <view class="wb-header">
      <view class="wb-back" @click="goBack">‹</view>
      <view class="wb-title">商品详情</view>
      <view class="wb-close" @click="goHome">✕</view>
    </view>
    <web-view class="wb-frame" :src="realUrl" />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="wb-redirect">
      <view class="wb-spinner" />
      <view class="wb-redirect-title">正在为您跳转商品详情</view>
      <view class="wb-redirect-sub">即将打开运营商页面…</view>
      <a class="wb-redirect-btn" :href="realUrl" rel="noopener noreferrer">立即跳转</a>
      <view class="wb-redirect-tip">如未自动跳转，请点击上方按钮</view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'

const realUrl = ref('')
const productId = ref('')

onLoad((options = {}) => {
  const u =
    options.url ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('url') : '')
  if (u) realUrl.value = u
  productId.value = options.id || ''
})

onMounted(() => {
  // #ifdef H5
  if (!realUrl.value) return
  // 生产环境：先用图片 GET 触发 Worker /track 上报点击（console.log），不阻塞跳转
  if (import.meta.env.PROD && productId.value) {
    try {
      const img = new Image()
      img.src = `/track?id=${encodeURIComponent(productId.value)}&to=${encodeURIComponent(realUrl.value)}&_t=${Date.now()}`
    } catch (e) {
      // 上报失败不影响跳转
    }
  }
  // 短暂延迟，让"跳转中"反馈可见，再同标签直接打开 main_link
  setTimeout(() => {
    window.location.href = realUrl.value
  }, 600)
  // #endif
})

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => uni.redirectTo({ url: '/pages/index/index' }) })
}
function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
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
  background: #fff;
}
/* #ifdef MP-WEIXIN || APP-PLUS */
.wb-header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12rpx;
  background: linear-gradient(135deg, #4A9FF5, #6BB6FF);
  color: #fff;
  flex: 0 0 auto;
}
.wb-back,
.wb-close {
  width: 80rpx;
  text-align: center;
  font-size: 36rpx;
  line-height: 44px;
}
.wb-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
}
.wb-frame {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}
/* #endif */

/* #ifdef H5 */
.wb-redirect {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%);
}
.wb-spinner {
  width: 72rpx;
  height: 72rpx;
  border: 6rpx solid #dbe9ff;
  border-top-color: #4A9FF5;
  border-radius: 50%;
  animation: wb-spin 0.9s linear infinite;
  margin-bottom: 40rpx;
}
@keyframes wb-spin {
  to { transform: rotate(360deg); }
}
.wb-redirect-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 16rpx;
}
.wb-redirect-sub {
  font-size: 26rpx;
  color: #888;
  margin-bottom: 56rpx;
}
.wb-redirect-btn {
  display: inline-block;
  padding: 20rpx 80rpx;
  background: #4A9FF5;
  color: #fff;
  border-radius: 48rpx;
  font-size: 30rpx;
  text-decoration: none;
}
.wb-redirect-tip {
  margin-top: 32rpx;
  font-size: 24rpx;
  color: #bbb;
}
/* #endif */
</style>
