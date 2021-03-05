<template>
  <div id="app">
     <keep-alive :include="keepAlive" >
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"/>
  </div>
</template>
<script>
export default {
  data(){
    return {
    }
  },
  computed:{
    keepAlive () {
      console.log('app alive',this.$store.getters.keepAlive)
      return this.$store.getters.keepAlive
    },
  },
  watch: {
     $route(to, from) {
     // 如果是从b到a页面，则不缓存b
       if(from.name === 'contractList' && to.name === 'quickSearch') {
         this.keepAlive = ['quickSearch']
       } else {
        //  this.keepAlive = ['a', 'b']
       }
     }
  }
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
