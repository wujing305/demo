<template>
  <div>
    <div>{{UserStoreModule.age}}</div>
    <div>{{UserStoreModule.trueAge}}</div>
    <div>{{UserStoreModule.name}}</div>
    <el-button type="primary" @click="UserStoreModule.addName('mutationName')">Mutation</el-button>
    <el-button type="primary" @click="UserStoreModule.addNameAsyn('actionName')">Action</el-button>
  </div>
</template>


<script lang='ts'>
import ApiWeb from "@/api/api_web";
import Cookies from "js-cookie";


import {Module,VuexModule,Mutation,Action,getModule,} from 'vuex-module-decorators';
import {UserStore} from "@/store/user"
const UserStore_ = getModule(UserStore)

//const UserStore = namespace("@/store/user");
//const UserStorele = namespace('@/store')
import {
  Component,
  Prop,
  Provide,
  Vue,
  Watch,
  Ref,
} from "vue-property-decorator";

//export default  {
@Component //一定要加上这个，否则无法输入数据，不知道为什么
export default class Demo2 extends Vue {
   private UserStoreModule = UserStore_
   
  //@(namespace("UserStore").State("age")) private age!: number; // 重命名
  // @UserStore.State("age") age; // 重命名
  // @UserStore.State("name") name; // 重命名

  // @UserStore.Getter("trueAge") trueAge;
  // @UserStore.Action("addNameAsyn") addNameAsyn;
  // @UserStore.Mutation("addName") addName;
}
</script>

<style scoped>
</style>