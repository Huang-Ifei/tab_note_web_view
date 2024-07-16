<script setup lang="ts">
//分类算法
import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";

const classes:Ref<[]> = ref([])
const emit = defineEmits(['doChoice'])
const props = defineProps(['class_name','classes'])

getClasses()

async function getClasses(){
  if (typeof props.classes=='undefined'||props.classes.length==0){
    const axiosResponse = await axios.get(getAddress() + "/getClasses")
    if (axiosResponse.data.response == "success") {
      classes.value = axiosResponse.data.classes
    }else {
      console.log(axiosResponse.data.response)
    }
  }else{
    classes.value=props.classes
  }
}
</script>

<template>
  <div id="classes" style="display: flex;flex-direction: row;overflow-x: scroll;align-items: center;padding-left: 2px;">
    <div v-for="className in classes">
      <button v-if="className!=class_name"  @click="emit('doChoice',className);" class="class_choice">
        {{className}}
      </button>
      <button v-if="className==class_name" @click="emit('doChoice','')"  class="class_choiced">
        {{className}}
      </button>
    </div>
  </div>
</template>

<style scoped>
.class_choice{
  margin-right: 10px;
  border-radius: 50px;
  white-space: nowrap;
  background: white;
  border: 1px solid #dfdfdf;
  color: #1c1c1c;
  margin-top: 5px;
  margin-bottom: 5px;
}
.class_choiced{
  margin-right: 10px;
  border-radius: 50px;
  white-space: nowrap;
  background: #ecf5ff;
  border: 1px solid #1c99ee;
  color: #1c1c1c;
  margin-top: 5px;
  margin-bottom: 5px;
}
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
  background-color: transparent;
  border: none;
  outline: none;
}

::-webkit-scrollbar-thumb {
  background-color: #bebebe;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  outline: none;
}
</style>