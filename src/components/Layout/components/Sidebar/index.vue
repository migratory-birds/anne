<template>
  <el-scrollbar wrapClass="scrollbar-wrapper">
    <el-menu mode="vertical" 
      :show-timeout="200" 
      :default-active="$route.path" 
      class="menu" 
      :background-color="variables.sideMenuBg" 
      :text-color="variables.menuText" 
      :active-text-color="variables.menuActiveText"
      >
      <sidebar-item v-for="route in sencond_routers" :key="route.name" :item="route" :base-path="route.path"></sidebar-item>
    </el-menu>
  </el-scrollbar>
</template>
<script>
import variables from '@/styles/variables.scss';
import SidebarItem from './SidebarItem.vue';

export default {
  name:'index',
  components:{
      SidebarItem
  },
  data(){
    return {

    }
  },
  computed:{
    activeMenu(){
      const route = this.$route;
        const { meta,path } = route;
        if(meta.activeMenu){
            return meta.activeMenu;
        }
        return path;
    },
    sidebar(){
      return this.$store.getters.sidebar;
    },
    topBarName(){
      console.log("顶部路由",this.$store.state.permission.topBarName)
      return this.$store.state.permission.topBarName;
    },
    sencond_routers(){
      console.log("渲染路由",this.$store.getters.permission_routers)
      // console.log("顶部路由",this.topBarName)
      // if(this.permission_routers){
      //   const routersCopy = JSON.parse(JSON.stringify(this.permission_routers)) 
      //   const result = routersCopy.filter(item=> item.name === this.topBarName)
      //   console.log(result)
      //   return result[0].children
      // }else {
      //   return this.$store.getters.permission_routers;
      // }
      return this.$store.getters.permission_routers;
    },
    variables(){
      return variables;
    }
  },
  
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:linear-gradient(-90deg,rgba(74,61,75,1),rgba(27,35,67,1));
$selected:rgb(64, 158, 255);
$txtColor:#fff;
.menu{
    color:$txtColor;
    .selected{
      color:$selected;
    }
    .el-menu-item.is-active {
      color:$selected;
    }
}
</style>