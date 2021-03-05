import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
//css
import "@/styles/index.scss"; // global css
import "@/permission"; // permission control
import "@/icons"; // icon

import * as filters from '@/filters'
//配置
Vue.config.productionTip = false
Vue.config.devtools = true;
// process.env.VUE_APP_MOCK && require('../mock/index');
//mock
// import '../mock'
//mixins
import IndexMix from '@/views/mixins/mixin';

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(IndexMix);
Vue.use(ElementUI);

Vue.prototype.hasPerm = function(permission){
  let btns = store.state.permission.btns;
  return btns.indexOf(permission) > -1;
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
