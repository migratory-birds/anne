<template>
  <div :class="classObj" class="app-wrapper">
    <!-- <div v-if="device === 'mobile'&& sidebar.opened" class="drawer-bg" @click="handleClickOutside"></div> -->
    <navbar></navbar>
    <div class="main-container">
        <sidebar class="sidebar-container"></sidebar>
        <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components';
import 'element-ui/lib/theme-chalk/display.css';
export default {
  name:'layout',
  components: {
    AppMain,
    Sidebar,
    Navbar,
  },
  data(){
    return {

    }
  },
  computed:{
    classObj(){
      return {
        // hideSidebar: !this.sidebar.opened,
        // openSidebar: this.sidebar.opened,
        // withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile',
      }
    },
    sidebar(){
      return this.$store.state.app.sidebar;
    },
    device() {
      return this.$store.state.app.device;
    },
  },
  methods:{
    handleClickOutside() {
      // console.info(111);
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";
@import 'src/styles/mixin.scss';
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  // background: #000;
  // opacity: 0.3;
  // width: 100%;
  // top: 0;
  // height: 100%;
  // position: absolute;
  // z-index: 999;
}
</style>