<template>
  <div>
    <p>hello</p>
    <el-button @click="postmsg()">postmessage</el-button>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Prop,
  Provide,
  Vue,
  Watch,
  Ref,
} from "vue-property-decorator";

import { State, Action, Mutation, Getter, namespace } from "vuex-class";

const ProjectStore = namespace("ProjectStore");

//export default  {
@Component //一定要加上这个，否则无法输入数据，不知道为什么
export default class Test extends Vue {
  @ProjectStore.Mutation("setCurrentProject") setCurrentProject;
  postmsg() {
    // this.setCurrentProject({
    //   currentExist: true,
    //   currentName: "hly",
    //   currentId: 1,
    // });
    // window.postMessage("message", window.location.href);
    //window.localStorage.setItem("zy","29")
   window.localStorage.hello= Math.random() +''
  }
}
</script>

<style>
</style>