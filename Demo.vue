<template>
  <div>
    <div>{{ age }}</div>
    <div>{{ trueAge }}</div>
    <div>{{ name }}</div>
    <el-button type="primary" @click="addName('mutationName')"
      >Mutation</el-button
    >
    <el-button type="primary" @click="addNameAsyn('actionName')"
      >Action</el-button
    >
  </div>
</template>


<script lang='ts'>
import ApiWeb from "@/api/api_web";
import Cookies from "js-cookie";

import {
  Component,
  Prop,
  Provide,
  Vue,
  Watch,
  Ref,
} from "vue-property-decorator";

import { State, Action, Mutation, Getter, namespace } from "vuex-class";
import store from '@/store/store';
//import Component from 'vue-class-component'

const UserStore = namespace("UserStore");
//const UserStore = namespace("@/store/user");
//const UserStorele = namespace('@/store')

//export default  {
@Component //一定要加上这个，否则无法输入数据，不知道为什么
export default class Demo extends Vue {
  //@(namespace("UserStore").State("age")) private age!: number; // 重命名
  @UserStore.State("age") age; // 重命名
  @UserStore.State("name") name; // 重命名

  @UserStore.Getter("trueAge") trueAge;
  @UserStore.Action("addNameAsyn") addNameAsyn;
  @UserStore.Mutation("addName") addName;

  // public created() {
  //     this.$store.registerModule("UserStore",store);
  // }
}
</script>

<style scoped>
</style>