import { getDeptList,getProcuctList,getChannelList,getProtocolTypeList,getProtocolTagList } from 'api/common';
import { getRoleList } from '@/api/statistics'

const state = {
    deptList:[],
    productNameList:[],
    channelNoList:[],
    protocolTypeList:[],
    protocolNameList:[],
    roleList:[]
};
const mutations = {
    deptList: (state, data) => {
        state.deptList = data;
    },
    productNameList: (state, data) => {
        state.productNameList = data;
    },
    channelNoList: (state, data) => {
        state.channelNoList = data;
    },
    protocolNameList: (state, data) => {
        state.protocolNameList = data;
    },
    protocolTypeList: (state, data) => {
        state.protocolTypeList = data;
    },
    roleList: (state, data) => {
        state.roleList = data;
    },
};
const actions = {
    // 获取操作部门
    getDeptList({ commit,param}){
        if(state.deptList.length > 0){
            return true;
        }
        return getDeptList().then(res => {
            console.log('re',res)
            commit('deptList',res.resData)
        })
    },
    getProductNameList({ commit,param}){
        if(state.productNameList.length > 0){
            return true;
        }
        return getProcuctList().then(res => {
            console.log('re',res)
            commit('productNameList',res.resData)
        })
    },
    getChannelList({ commit,param}){
        if(state.channelNoList.length > 0){
            return true;
        }
        return getChannelList().then(res => {
            console.log('re',res)
            commit('channelNoList',res.resData)
        })
    },
    getProtocolTypeList({ commit,param}){
        if(state.protocolTypeList.length > 0){
            return true;
        }
        return getProtocolTypeList().then(res => {
            console.log('re',res)
            commit('protocolTypeList',res.resData)
        })
    },
    getProtocolNameList({ commit,param}){
        if(state.protocolNameList.length > 0){
            return true;
        }
        return getProtocolTagList().then(res => {
            console.log('re',res)
            commit('protocolNameList',res.resData)
        })
    },
    // 获取操作角色
    getRoleList({ commit,param}){
        if(state.roleList.length > 0){
            return true;
        }
        return getRoleList().then(res => {
            console.log('getRoleList',res)
            commit('roleList',res.resData)
        })
    },
};
const common = {
    state,
    mutations,
    actions,
};
export default common;