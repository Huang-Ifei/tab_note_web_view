<script setup>
import {computed, ref} from 'vue';

const startIdx = ref(0);
const model = defineModel()

function updateSlider() {
  startIdx.value = Number(startIdx.value);

  model.value.borderRadius = `${startIdx.value }px`
}

const leftOffset = computed(() => `${startIdx.value }px`);
const leftPresence = computed(() => `${startIdx.value}%`);

</script>

<template>
  <div class="slider-container">
    <p style="margin: 0;width: 100%;padding-left: 10px">内圆角：{{ leftOffset }}</p>

    <div class="range-slider">
      <input
          type="range"
          class="thumb1"
          :min="0"
          :max="100"
          v-model="startIdx"
          @input="updateSlider"
      />
      <div class="slider-track">
        <div
            class="slider-range"
            :style="{ width: leftPresence }"
        ></div>
      </div>
    </div>
    <div style="display: flex;flex-direction: row;width: 95%;">
      <div class="month" style="width: calc(25% - 10px)">0px</div>
      <div class="month">25px</div>
      <div class="month">50px</div>
      <div class="month" style="width: calc(25% - 25px)">75px</div>
      <div class="month" style="width: calc(35px)">100px</div>
    </div>
  </div>
</template>

<style scoped>
.slider-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 95%;
}

.range-slider {
  position: relative;
  width: 100%;
}

.thumb1 {
  position: absolute;
  z-index: 99;
  width: calc(99% - 12px);
  pointer-events: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
}

.thumb1::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: #fff;
  border: 2px solid #0077ff;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
}

.slider-track {
  position: relative;
  height: 10px;
  background: #d7d7d7;
  border-radius: 10px;
  margin: 12px;
}

.slider-range {
  position: absolute;
  height: 100%;
  background: #15a3ff;
  border-radius: 10px;
}

.month {
  width: 25%;
  height: 14px;
  color: #8a8a8a;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  font-size: 12px
}
</style>