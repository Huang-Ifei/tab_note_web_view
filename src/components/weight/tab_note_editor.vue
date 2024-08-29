<script setup>

import '@wangeditor/editor/dist/css/style.css'
import {nextTick, onBeforeUnmount, onMounted, shallowRef} from "vue";
import {Editor, Toolbar} from '@wangeditor/editor-for-vue';
import {getAddress} from "../../operation/address.ts";
import {DomEditor} from "@wangeditor/editor";

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = defineModel()

// 模拟 ajax 异步获取内容
//onMounted(() => {
//  setTimeout(() => {
//   valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
//  }, 1500)
//})

const toolbarConfig = {}
const editorConfig = {placeholder: '请输入内容...', MENU_CONF: {}}
const mode = 'default'

toolbarConfig.excludeKeys = [
  'group-video',
  'fullScreen',
  'italic'
]

editorConfig.MENU_CONF['uploadImage'] = {
  server: getAddress() + "/upload_tab_note_img",
  maxFileSize: 1048576,
  onSuccess() {
    console.log("success")
  },
  onFailed(file, res) {
    console.log("上传失败" + file.name)
    alert(file.name + "上传失败，请核对图片格式，建议使用：JPEG，JPG，PNG格式的图片")
  },
  onError(file, err, res) {
    if (err.toString().includes("maximum allowed")) {
      alert(file.name + "的大小超过1MB，请压缩后上传")
    }
    console.log(err.toString().includes("maximum allowed"))
  },

}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

</script>

<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 500px"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
  </div>
</template>

<style>

</style>