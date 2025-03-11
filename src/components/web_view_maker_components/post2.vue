<script setup lang="js">
import {ref, onMounted, onUnmounted} from 'vue';

let currentIndex = ref(0);
let slides = ref([]);
const props = defineProps(["css","sty"])

function showSlide(index) {
  const nextIndex = (index + 1) % slides.value.length;
  const prevIndex = (index - 1 + slides.value.length) % slides.value.length;

  slides.value.forEach((slide, i) => {
    slide.classList.remove('active');
    slide.style.transform = 'translateX(0) scale(0.7)';
    slide.style.zIndex = 1;

    if (i === index) {
      slide.classList.add('active');
      slide.style.transform = 'scale(1)';
      slide.style.opacity = "1";
      slide.style.zIndex = 10;
    } else if (i === nextIndex) {
      slide.style.transform = 'translateX(100%) scale(0.8)';
      slide.style.opacity = "1";
    } else if (i === prevIndex) {
      slide.style.transform = 'translateX(-100%) scale(0.8)';
      slide.style.opacity = "1";
    } else {
      slide.style.opacity = "0";
    }
  });
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
  showSlide(currentIndex.value);
}

let interval;

onMounted(() => {
  slides.value = document.querySelectorAll('.slide');
  showSlide(currentIndex.value);
  interval = setInterval(nextSlide, 2000);
});

onUnmounted(() => {
  clearInterval(interval);
});

</script>

<template>
  <div class="carousel" :style="props.sty">
    <div class="slide active" :style="{borderRadius:props.css.borderRadius}">
      <img style="height: 220px;width: auto" src="../../assets/web_view_maker_standard/image1.jpg" alt="Image 1" :style="{borderRadius:props.css.borderRadius}">
    </div>
    <div class="slide" :style="{borderRadius:props.css.borderRadius}">
      <img style="height: 220px;width: auto" src="../../assets/web_view_maker_standard/image2.jpg" alt="Image 2" :style="{borderRadius:props.css.borderRadius}">
    </div>
    <div class="slide" :style="{borderRadius:props.css.borderRadius}">
      <img style="height: 220px;width: auto" src="../../assets/web_view_maker_standard/image3.jpg" alt="Image 3" :style="{borderRadius:props.css.borderRadius}">
    </div>
    <div class="slide" :style="{borderRadius:props.css.borderRadius}">
      <img  style="height: 220px;width: auto" src="../../assets/web_view_maker_standard/image4.jpg" alt="Image 4" :style="{borderRadius:props.css.borderRadius}">
    </div>
    <div class="slide" :style="{borderRadius:props.css.borderRadius}">
      <img  style="height: 220px;width: auto" src="../../assets/web_view_maker_standard/image5.jpg" alt="Image 5" :style="{borderRadius:props.css.borderRadius}">
    </div>
  </div>
</template>

<style scoped>
.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 220px;
  margin:10px 0 ;
  position: relative;
}

.slide {
  transition: transform 0.5s, opacity 0.5s;
  transform: scale(0.7);
  position: absolute;
  height: 220px;
}

.slide.active {
  opacity: 1;
  transform: scale(1);
  z-index: 10;
}

.slide:nth-child(2) {
  transform: translateX(-100%) scale(0.8);
}

.slide:nth-child(5) {
  transform: translateX(100%) scale(0.8);
}
</style>