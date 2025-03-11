<script setup lang="js">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Post2 from "../web_view_maker_components/post2.vue";
import Text1 from "../web_view_maker_components/text1.vue";
import Title1 from "../web_view_maker_components/title1.vue";
import Magin_selector from "../weight/magin_selector.vue";
import Inside_radius_selector from "../weight/inside_radius_selector.vue";
import Magin_bottom_selector from "../weight/magin_bottom_selector.vue";


let max = 0;
const choice = ref(0);
const htmlList = ref([]);

function newPost(type) {
  if (type === "post2") {
    htmlList.value.push({
      id: max,
      type: type,
      component: Post2,
      text: "",
      child: {},
      pictures: [],
      css: { borderRadius: "15px" },
      style: {}
    });
    choice.value = max;
    max++;
  }
}

function newText(text) {
  htmlList.value.push({
    id: max,
    type: "text1",
    component: Text1,
    text: text,
    child: {},
    pictures: [],
    css: {},
    style: {}
  });
  choice.value = max;
  max++;
}

function newTitle(text) {
  htmlList.value.push({
    id: max,
    type: "title1",
    component: Title1,
    text: text,
    child: { a: [{ name: "主页", href: "/index.html" }, { name: "第二页", href: "/component2.html" }] },
    pictures: [],
    css: {},
    style: {}
  });
  choice.value = max;
  max++;
}

function deletePost(id) {
  htmlList.value = htmlList.value.filter(item => item.id !== id);
}

const router = useRouter();

function reduceView(item) {
  if (item.name === "" && item.href === "") {
    const childItem = htmlList.value.find(h => h.id === choice.value)?.child;
    if (childItem && childItem.a) {
      childItem.a = childItem.a.filter(it => !(it.name === "" && it.href === ""));
    }
  }
}

// 控制显示的条件
const lineSelectorShow = ["post2"];
const irsShow = ["post2"];
const inputShow = ["text1"];
const mgbShow = ["post2", "title1", "text1"];
const titleEditShow = ["title1"];
</script>

<template>
  <div class="low_code_background">
    <div class="left_items">
      <div style="position: absolute; padding: 20px;">
        <img alt="back" style="cursor: pointer;width: 20px;height: 20px;" @click="router.back()"
             src="../../assets/arrow_back.svg">
      </div>
      <h3>组件列表</h3>
      <ul class="component-list">
        <li @click="choice=item.id" class="component-item" v-for="(item, index) in htmlList" :key="item.id">
          {{ item.id }}:{{ item.type }}
          <img
              alt="delete"
              style="cursor: pointer; margin-left: 10px;"
              @click="deletePost(item.id)"
              src="../../assets/close.svg"
          />
        </li>
      </ul>
      <div v-if="htmlList.find(h => h.id===choice)!=null" class="action-list">
        <p style="padding: 5px;font-weight: bold">调节第{{ choice }}个元素的参数</p>
        <magin_selector v-if="lineSelectorShow.some(value => value===htmlList.find(h => h.id===choice)?.type)"
                       v-model="htmlList.find(h => h.id===choice).style">

        </magin_selector>
        <inside_radius_selector v-if="irsShow.some(value => value===htmlList.find(h => h.id===choice)?.type)"
                                v-model="htmlList.find(h => h.id===choice).css"/>
        <input @keyup.enter="newText('');choice=max-1"
               v-if="inputShow.some(value => value===htmlList.find(h => h.id===choice)?.type)"
               v-model="htmlList.find(h => h.id===choice).text"/>
        <magin_bottom_selector v-if="mgbShow.some(value => value===htmlList.find(h => h.id===choice)?.type)"
                               v-model="htmlList.find(h => h.id===choice).style"/>
        <div v-if="titleEditShow.some(value => value===htmlList.find(h => h.id===choice)?.type)" v-for="(item, index) in htmlList.find(h => h.id==choice)?.child.a" :key="index">
          <input style="width: calc(40% - 20px)" v-model="item.name" @keyup.delete="reduceView(item)" @keyup.enter="htmlList.find(h => h.id==choice)?.child.a.push({name: '', href: '/'})"/>
          <input style="width: calc(40% - 20px)" v-model="item.href" @keyup.delete="reduceView(item)" @keyup.enter="htmlList.find(h => h.id==choice)?.child.a.push({name: '', href: '/'})"/>
        </div>
      </div>
    </div>

    <div class="low_code_left">
      <div>
        <component v-for="(c, i) in htmlList" :key="i" :is="c.component" :child="c.child" :sty="c.style" :css="c.css"
                   :text="c.text"/>
      </div>
    </div>

    <div class="low_code_right">
      <h3>客制化网页制作</h3>
      <button v-if="!htmlList.some(item => item.type === 'post2')"
              @click="newPost('post2')">
        添加超级滚动海报（至多添加一次）
      </button>
      <button @click="newText('文本内容')">
        添加普通文字
      </button>
      <button @click="newTitle('页眉内容')">
        添加页眉
      </button>
    </div>
  </div>
</template>

<style scoped>
@import "../../operation/web_view_maker.css";
</style>