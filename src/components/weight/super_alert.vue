<script setup lang="ts">

const props = defineProps(['info'])
const emit = defineEmits(['cancel','check'])

</script>

<template>
  <div class="bg">
    <div class="alr">
      <div v-html="props.info" style="position: relative;display: flex; align-items: center; justify-content: center;min-height: 100%;padding: 12px">

      </div>
      <div class="check_box">
        <button @click="emit('cancel')" class="cancel_button">
          取消
        </button>
        <button @click="emit('check')" class="check_button">
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cancel_button {
  width: 50%;
  height: 45px;
  border-top: rgba(0, 0, 0, 0.2) solid 1px;
  border-right: rgba(0, 0, 0, 0.2) solid 0.5px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 0 0 10px;
  color: #1e1f22;
  background-color: transparent;
}
.cancel_button:hover,
.check_button:hover,
.cancel_button:focus,
.check_button:focus  {
background: rgba(0, 0, 0, 0.05);
}
.check_button {
  width: 50%;
  height: 45px;
  border-radius: 0 0 10px 0;
  color: #0883fb;
  border-top: rgba(0, 0, 0, 0.2) solid 1px;
  border-left: rgba(0, 0, 0, 0.2) solid 0.5px;
  border-right: none;
  border-bottom: none;
  background-color: transparent;
}

.check_box {
  display: flex;
  flex-direction: row;
  min-width: 100%;
  min-height: 100%;
  justify-content: center;
}

.alr {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  min-width: 280px;
  max-width: 400px;
  border-radius: 10px;
  position: relative;
}

.bg {
  min-width: 100%;
  min-height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  z-index: 999;
}
</style>