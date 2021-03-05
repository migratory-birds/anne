import Vue from 'vue';
import Vuex from 'vuex';
import common from './modules/common';
import user from './modules/user';
import permission from './modules/permission';
import app from './modules/app';

import getters from "./getters";
Vue.use(Vuex);
const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        app,
        common,
        user,
        permission,
    },
    getters
});
export default store;