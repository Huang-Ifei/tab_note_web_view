<script setup>
import {computed, ref} from 'vue';

const startIdx = ref(0);
const endIdx = ref(100);
const model = defineModel()

function updateSlider() {
  startIdx.value = Number(startIdx.value);
  endIdx.value = Number(endIdx.value);

  if (startIdx.value >= endIdx.value) {
    startIdx.value = endIdx.value - 1;
    endIdx.value = startIdx.value + 1;
  }
  model.value.marginLeft = leftOffset.value
  model.value.marginRight = rightOffset.value
  model.value.width = `${endIdx.value - startIdx.value}%`;
}

const leftOffset = computed(() => `${startIdx.value }%`);
const rightOffset = computed(() => `${100 - endIdx.value}%`);
</script>

<template>
  <div class="slider-container">
    <p style="margin: 0;width: 100%;padding-left: 10px">左间距：{{ leftOffset }}，右间距：{{rightOffset}}</p>

    <div class="range-slider">
      <input
          type="range"
          class="thumb1"
          :min="0"
          :max="99"
          v-model="startIdx"
          @input="updateSlider"
      />
      <input
          type="range"
          class="thumb2"
          :min="1"
          :max="100"
          v-model="endIdx"
          @input="updateSlider"
      />
      <div class="slider-track">
        <div
            class="slider-range"
            :style="{ left: leftOffset, right: rightOffset }"
        ></div>
      </div>
    </div>
    <div style="display: flex;flex-direction: row;width: 95%;">
      <div class="month" style="width: calc(25% - 10px)">0%</div>
      <div class="month">25%</div>
      <div class="month">50%</div>
      <div class="month" style="width: calc(25% - 25px)">75%</div>
      <div class="month" style="width: calc(35px)">100%</div>
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
  border: 2px solid #15c100;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
}

.thumb2 {
  position: absolute;
  z-index: 99;
  width: calc(99% - 12px);
  margin-left: calc(1%);
  pointer-events: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
}

.thumb2::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: #fff;
  border: 2px solid #0061c1;
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
  background: linear-gradient(45deg, #15c100, #009cff);
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