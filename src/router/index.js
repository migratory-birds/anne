import Vue from "vue";
import Router from "vue-router";
import Layout from "@/components/Layout/index.vue";
Vue.use(Router);
export var constantRoutes = [
  {
      path: "/404",
      component: () => import("@/views/404"),
      hidden: true
  },
  {
      path: "/",
      component: Layout,
      hidden: true
  },
  {
      path:'/fileDetail',
      component: () => import("@/components/FileDetail/fileDetail.vue"),
      name:'fileDetail',
      hidden:true,   
      meta: {
          title: "查看",
          role: "fileDetail",
        }
  },
  {
    path: '/table',
    name: 'table',
    component: () => import("@/views/table.vue"),
    meta: { title: "表格", icon: "user" }
  },
];

const routerMap = {
  'dashBoard': {
    path: 'workbench',
    name: 'workbench',
    component: () => import("@/views/workbench/workbench.vue"),
    meta: { title: "工作台", icon: "user" }
  },
  'quickIndex': {
    path: 'quickSearch',
    name: 'quickSearch',
    component: () => import("@/views/quickSearch/quicksearch.vue"),
    meta: { title: "快速搜索", icon: "user", keepAlive: true },
    children: [
      {
        path:'/contractList/contractList',
        name:'contractList',
        component: () => import("@/views/quickSearch/contractList/contractList.vue"),
        meta: { parentTitle: '快速搜索', title: "合同列表", icon: "user", keepAlive: true }
      }
    ]
  },
  'protocolManage': {
    path: 'protocolMng',
    name: 'protocolMng',
    component: () => import("@/views/protocolMng/protocolMng.vue"),
    meta: { title: "协议管理", icon: "user" }
  },
  'contractManage': {
    path: 'certificateMng',
    name: 'certificateMng',
    component: () => import("@/views/certificateMng/certificateMng.vue"),
    meta: { title: "存证管理", icon: "user" }
  },
  'protocolDataStatistic': {
    path: '/statistics/protocol',
    name:'protocol',
    component: () => import("@/views/statistics/protocol/protocol.vue"),
    meta: { title: "协议统计", icon: "user" }
  },
  'contractDataStatistic': {
    path:'/statistics/certificate',
    name:'certificate',
    component: () => import("@/views/statistics/certificate/certificate.vue"),
    meta: { title: "存证统计", icon: "user" }
  },
  'operationLog': {
    path: '/statistics/log',
    name: 'log',
    meta: { title: "操作日志", icon: "user" },
    component: () => import("@/views/statistics/log/log.vue")
  },
  'authoritiesManage': {
    path: 'permission',
    name: 'permission',
    component: () => import("@/views/permission/permission.vue"),
    meta: { title: "权限管理", icon: "user" }
  }
}


export function getRoute(data){
  let routes = [];
  let defautRoutePath = ''; // 登陆后跳到默认路由路径
  data.forEach((item,index) => {
    if(item.children && item.children.length){
      let children = [];
      item.children.forEach((item2,index) => {
        if(item2.urlFlag && routerMap[item2.urlFlag]){
          let item2Map = routerMap[item2.urlFlag];
          // 登陆后，有快速搜索权限进入快速搜索，无权限进入权限列表第一个页面
          if (!defautRoutePath || item2.urlFlag === 'quickIndex') {
            defautRoutePath = item2Map.path;
          }
          children.push(
            Object.assign({},item2Map,{
              children: null,
              meta: Object.assign({},item2Map.meta,{
                title: item2.text,
                id: item2.id
              })
            })
          )
          if(item2Map.children && item2Map.children.length){
            let childs = item2Map.children;
            childs.forEach(child => {
              child.meta.title = `${item2.text}${child.meta.title}`;
              child.hidden = true;
              child.meta.id = item2.id;
            })
            children = children.concat(childs)
          }
        }
      })
      routes.push({
        path:'',
        component: Layout,
        redirect: '',
        name: item.text,
        meta: { title: item.text, icon: '',id:item.id},
        children
      })
    } else {
      if(item.urlFlag && routerMap[item.urlFlag]){
        let itemMap = routerMap[item.urlFlag];
        // 登陆后，有快速搜索权限进入快速搜索，无权限进入权限列表第一个页面
        if (!defautRoutePath || item.urlFlag === 'quickIndex') {
          defautRoutePath = itemMap.path;
        }
        let children = [
          Object.assign({},itemMap,{
            children: null,
            meta: Object.assign({},itemMap.meta,{
              title: item.text,
              id: item.id
            })
          })
        ]
        if(itemMap.children && itemMap.children.length){
          let childs = itemMap.children;
          childs.forEach(child => {
            child.meta.title = `${item.text}${child.meta.title}`;
            child.hidden = true;
            child.meta.id = item.id;
          })
          children = children.concat(childs)
        }
        routes.push({
          path: '',
          name: item.text,
          hasOneShowingChildren: true,
          component: Layout,
          children
        })

      }
    }
  })
  console.log(routes)
  // return routes;
  return { routes, defautRoutePath }
}



export default new Router({
    // mode: 'history', //后端支持可开
    // mode: "hash",
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });