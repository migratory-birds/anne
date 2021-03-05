import router, { getRoute } from './router';
import store from './store';
import NProgress from 'nprogress'; // Progress 进度条
import 'nprogress/nprogress.css'; // Progress 进度条样式
import { getMenu, findPrivilege } from '@/api/login'
import { deepCopy } from '@/utils'


router.beforeEach((to, from, next) => {
  
  NProgress.start();
  if (to.meta.keepAlive) {
    store.commit('keepAlive', to.name);
  }
  if (!store.getters.permission_routers || store.getters.permission_routers.length === 0) {
    getMenu().then(res => {
      let arr = deepCopy(res.resData)
      store.commit('SET_MENU',arr)
      let { routes, defautRoutePath } = getRoute(arr)
      store.dispatch('GenerateRoutes', { permissionList: routes }).then(() => {
        router.addRoutes(store.getters.permission_routers)
        if(to.path === '/404'){
          next({path: to.redirectedFrom});
        }else if (to.path === '/') {
          // 登陆后，有快速搜索权限进入快速搜索，无权限进入权限列表第一个页面
          if (defautRoutePath) {
            next({path: defautRoutePath})
          } else {
            next();
          }
          
        }else{
          let flag = to.meta.id;
          if(flag){
            findPrivilege({ menuId: flag }).then(res => {
              let btnArr = res.resData.map(item => item.privilegeFlag)
              store.commit('SET_BTNS',btnArr)
              next({...to});
            })
          } else {
            next({...to});
          } 
        }
        
      })
    })
  } else {
    let flag = to.meta.id;
    if(flag){
      findPrivilege({ menuId: flag }).then(res => {
        let btnArr = res.resData.map(item => item.privilegeFlag)
        store.commit('SET_BTNS', btnArr)
        next();
      })
    }else{
      next();
    } 
  }
});

router.afterEach((to,from) => {
  NProgress.done(); // 结束Progress
});
