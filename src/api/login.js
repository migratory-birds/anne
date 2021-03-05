import { sendAjax } from '@/api/index';

// 获取菜单权限列表
export function getMenu() {
  return sendAjax({
    url: '/bg/menu/getMenu',
    method: 'get'
  })
}

// 根据菜单id获取按钮权限
export function findPrivilege(data){
  return sendAjax({
    url: '/bg/privilege/findPrivilege',
    method: 'post',
    data
  })
}

// 退出登录
export function exit() {
  return sendAjax({
    url: '/bg/sso/exit',
    method: 'get'
  })
}

// 获取登录角色名
export function findUserName() {
  return sendAjax({
    url: '/bg/user/findUserName',
    method: 'get'
  })
}