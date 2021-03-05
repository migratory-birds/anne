
const state = {
    username: ''
};
const mutations = {
    getUserName: (state, data) => {
        state.username = data;
    },
};
const actions = {

};
const user = {
    state,
    mutations,
    actions
};
export default user;