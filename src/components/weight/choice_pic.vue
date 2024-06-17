<script setup lang="ts">
import Compressor from "compressorjs";
import {ref} from "vue";

const imageUrl = ref()
defineProps(['pics'])
const emit = defineEmits(['doSelect','doDelete'])

function handleFileChange(event: Event) {
  //事件的目标作为HTML输入组件
  const target = event.target as HTMLInputElement;
  //输入组件的第0个文件
  const file: File | null = (target.files && target.files[0]) || null;

  if (file) {
    try {
      //压缩文件
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
        convertSize: 240000,
        mimeType: 'image/jpeg',
        success(result) {//成功执行：reader读取内容到imageUrl中（base64编码）
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            imageUrl.value = base64String;

            emit("doSelect", imageUrl.value)

            console.log(base64String);
          };
          reader.readAsDataURL(result instanceof Blob ? result : new Blob([result]));
        },
        error(error) {
          console.error('Compression error:', error.message);
        },
      });
    } catch (e) {
      console.error(e)
    }
  } else {
    // 如果没有选择文件，重置图片 URL
    imageUrl.value = null;
  }
}

function clickInputImg() {
  document?.getElementById('add_new')?.click()
}

function delete_Img(s:string){
  emit('doDelete',s)
}

</script>

<template>
  <div style="display: flex;flex-direction: row;align-items: center;margin-bottom: 5px">
    图片（alpha公测版）：
    <button id="add" @click="clickInputImg">
      <input id="add_new" type="file" accept="image/*" @change="handleFileChange($event)"/>
      添加图片
    </button>
  </div>
  <div id="pics" style="display: flex;flex-direction: row;overflow-x: auto;align-items: center;scroll-behavior: smooth;">
    <div v-for="imgSrc in pics" style="padding-right: 10px;display: flex;flex-direction: row;">
      <img alt="img"  class="pictures" :src="imgSrc">
      <button @click="delete_Img(imgSrc)" style="cursor: pointer;color: #1a1a1a;background: transparent;padding: 0;height: 25px;">
        <img src="../../assets/close.svg">
      </button>
    </div>

  </div>
</template>

<style scoped>
#add {
  border: 1px solid #b2b2b2;
  background: white;
  color: #545454;
  padding: 10px;
}

#add:hover {
  outline: none;
  color: #1a98ee;
  border: #1a98ee solid 1px;
  box-shadow: 0 0 8px #c6e9ff;
}

#add:focus {
  outline: none;
  color: #1a98ee;
  border: #1a98ee solid 1px;
  box-shadow: 0 0 8px #c6e9ff;
}

#add_new {
  position: absolute;
  color: transparent;
  background: rgba(26, 152, 238, 0.5);
  padding: 0;
  border: transparent;
  cursor: pointer;
  box-shadow: none;
  display: none;
}

.pictures {
  max-width: 400px;
  max-height: 200px;
}
</style>