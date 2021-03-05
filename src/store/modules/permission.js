import { constantRoutes } from '@/router/index';


const state = {
  routers: [],
  keepAlive: [],
  btns: [],
  menu:[],
};
const mutations = {
  SET_KEEP_ALIVE: (state, keepAlive) => {
      state.keepAlive = keepAlive;
  },
  keepAlive(state, component) {
      // 注：防止重复添加（当然也可以使用Set）
      !state.keepAlive.includes(component) &&
      state.keepAlive.push(component);
  },
  SET_ROUTERS: (state, routers) => {
    state.routers = constantRoutes.concat(routers);
  },
  SET_BTNS: (state, values) => {
    state.btns = values
  },
  SET_MENU: (state, values) => {
    state.menu = values
  }
};
const actions = {
  setKeepAlive({ commit }, data){
    commit('SET_KEEP_ALIVE',data)
  },
  GenerateRoutes({ commit }, data) {
    return new Promise(resolve => {
      const { permissionList } = data
      commit('SET_ROUTERS', permissionList)
      resolve();
    });
  },
};
const permission = {
  state,
  mutations,
  actions,
};
export default permission;