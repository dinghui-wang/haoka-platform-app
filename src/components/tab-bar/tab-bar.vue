<template>
  <view class="custom-tabbar">
    <view class="tabbar-item" v-for="(tab, index) in tabs" :key="index" :class="{ active: current === index }"
      @click="handleTab(index)">
      <text class="tabbar-icon">{{ tab.icon }}</text>
      <text class="tabbar-text">{{ tab.text }}</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  // 当前激活的 tab 索引：0 首页 / 1 订单 / 2 本地号卡 / 3 客服
  current: {
    type: Number,
    default: 0,
  },
})

const tabs = [
  { icon: '🏠', text: '首页', url: '/pages/index/index' },
  { icon: '📋', text: '订单', url: '/pages/order/index' },
  { icon: '👤', text: '本地号卡', url: '/pages/local-card/index' },
  { icon: '🎧', text: '客服', url: '/pages/customer-service/index' },
]

function handleTab(index) {
  if (index === props.current) return
  uni.redirectTo({ url: tabs[index].url })
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  height: 100%;
  padding: 8rpx 20rpx;

  &.active .tabbar-text {
    color: #7B68EE;
    font-weight: 600;
  }
}

.tabbar-icon {
  font-size: 42rpx;
  line-height: 1;
}

.tabbar-text {
  font-size: 21rpx;
  line-height: 1.2;
  font-weight: 400;
  color: #999;
}
</style>
