<script setup lang="js">
import {onMounted, onUnmounted} from "vue";

const items = document.querySelectorAll('.carousel-item');
let currentIndex = 2; // 初始中间图片的位置

function updateCarousel() {
  // 重置所有图片样式
  items.forEach((item) => {
    item.style.transform = 'scale(1)';
    item.style.opacity = '0.5';
  });

  // 设置中间图片样式
  items[currentIndex].style.transform = 'scale(2)';
  items[currentIndex].style.opacity = '1';

  // 设置两侧中间图片样式
  const leftIndex = currentIndex - 1;
  const rightIndex = currentIndex + 1;

  if (leftIndex > 0) {
    items[leftIndex].style.transform = 'scale(1.2)';
    items[leftIndex].style.opacity = '0.8';
  }
  items[rightIndex].style.transform = 'scale(1.2)';
  items[rightIndex].style.opacity = '0.8';
}




onMounted(() => {
  // 点击按钮进行轮转
  document.getElementById('prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
  });

  document.getElementById('next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  });

  // 初始化展示栏
  updateCarousel();

});

onUnmounted(() => {

});
</script>

<template>
  <div class="carousel">
    <div class="carousel-item">1</div>
    <div class="carousel-item">2</div>
    <div class="carousel-item">3</div>
    <div class="carousel-item">4</div>
    <div class="carousel-item">5</div>
  </div>
  <button id="prev">Previous</button>
  <button id="next">Next</button>
</template>

<style scoped>
.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 80%;
  margin: auto;
  position: relative;
}

.carousel-item {
  transition: transform 0.5s, opacity 0.5s;
  width: 100px;
  height: 150px;
  opacity: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 中间最大 */
.carousel-item:nth-child(3) {
  transform: scale(1.5);
  opacity: 1;
}

/* 两侧中间 */
.carousel-item:nth-child(2),
.carousel-item:nth-child(4) {
  transform: scale(1.2);
  opacity: 0.8;
}

button {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
}
</style>