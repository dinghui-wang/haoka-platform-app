<!--
  商品详情 webview 中转页
  - H5：渲染 <iframe>（你的号卡详情页允许 iframe 嵌套）
  - 小程序/App：渲染 uni-app 的 <web-view> 组件
  - 接收的 url 形如：https://bk.kahone.top/p/{id}?to={编码后的真实链接}
    该 URL 在 CF Function 端做白名单校验后 302 跳到真实运营商页
  - 顶栏始终是 bk.kahone.top，外部真实链接不暴露
-->
<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'

const realUrl = ref('')
const title = ref('')
const loading = ref(true)
const error = ref('')

// onLoad 兼容 H5：从 query.url 取（uni 在 H5 下通常通过 onLoad 入参取；这里加兜底）
onLoad((options = {}) => {
  const u = options.url || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('url') : '')
  if (!u) {
    error.value = '缺少 url 参数'
    loading.value = false
    return
  }
  realUrl.value = u
  title.value = options.title || '商品详情'
  // H5 端 onload 在 iframe 加载完成后由下面事件触发
  loading.value = false
})

// H5：监听 iframe onload 关闭 loading，onerror 显示错误
onMounted(() => {
  // #ifdef H5
  const f = document.querySelector('iframe.wb-frame')
  if (f) {
    f.addEventListener('load', () => { loading.value = false })
    f.addEventListener('error', () => {
      loading.value = false
      error.value = '运营商页面无法加载，请稍后重试'
    })
  }
  // #endif
})

function reload() {
  error.value = ''
  loading.value = true
  // 重新给 src 赋值触发刷新
  realUrl.value = realUrl.value + (realUrl.value.includes('?') ? '&' : '?') + '_t=' + Date.now()
}

function goBack() {
  // #ifdef H5
  if (window.history.length > 1) window.history.back()
  else window.location.href = '/'
  // #endif
  // #ifdef MP-WEIXIN || APP-PLUS
  uni.navigateBack({ delta: 1, fail: () => uni.redirectTo({ url: '/pages/index/index' }) })
  // #endif
}

function goHome() {
  // #ifdef H5
  window.location.href = '/'
  // #endif
  // #ifdef MP-WEIXIN || APP-PLUS
  uni.reLaunch({ url: '/pages/index/index' })
  // #endif
}

// 拦截物理返回（小程序/App）
onBackPress(() => { goBack() })
</script>

<template>
  <view class="webview-page">
    <!-- 顶部固定头（与全局店铺风格保持一致） -->
    <view class="wb-header">
      <view class="wb-back" @click="goBack">‹</view>
      <view class="wb-title">{{ title || '商品详情' }}</view>
      <view class="wb-close" @click="goHome">✕</view>
    </view>

    <!-- H5：用原生 iframe；小程序/APP：走条件编译的 <web-view> -->
    <!-- #ifdef H5 -->
    <iframe class="wb-frame" :src="realUrl" frameborder="0" referrerpolicy="no-referrer-when-downgrade"
      allow="fullscreen" />
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN || APP-PLUS -->
    <web-view class="wb-frame" :src="realUrl" />
    <!-- #endif -->

    <!-- 加载态/空态/失败态 -->
    <view v-if="loading" class="wb-mask">
      <view class="wb-loading">加载中…</view>
    </view>
    <view v-if="error" class="wb-mask">
      <view class="wb-error">
        <view class="wb-error-title">页面加载失败</view>
        <view class="wb-error-sub">{{ error }}</view>
        <view class="wb-error-btn" @click="reload">重试</view>
      </view>
    </view>
  </view>
</template>

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
  background: linear-gradient(135deg, #4A9FF5, #6BB6FF);
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

.wb-error {
  text-align: center;
  padding: 40rpx;
}

.wb-error-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.wb-error-sub {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 32rpx;
  word-break: break-all;
}

.wb-error-btn {
  display: inline-block;
  padding: 16rpx 48rpx;
  background: #4A9FF5;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
