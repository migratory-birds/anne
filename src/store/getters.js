const getters = {
    name: state => state.user.name,
    roles: state => state.user.roles,
    loginInfo: state => state.user.loginInfo,
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    permission_routers: state => state.permission.routers,
    keepAlive:state => state.permission.keepAlive,
};
export default getters;