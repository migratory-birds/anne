import { sendAjax } from '@/api/index';

//  角色列表
export function findRoleByPagination(data, options) {
  return sendAjax({
    url: '/bg/role/findRoleByPagination',
    method: 'post',
    data
  }, options)
}

// 同步角色信息
export function manualSyncRole(data, options) {
  return sendAjax({
    url: '/bg/role/manualSyncRole',
    method: 'get',
    data
  }, options)
}

// 查看角色权限信息
export function getMenuPrivilegeList(data, options) {
  return sendAjax({
    url: `/bg/role/getMenuPrivilegeList/${data.roleId}`,
    method: 'get',
  }, options)
}

//  保存角色权限信息
export function saveMenuPrivilege(data, options) {
  return sendAjax({
    url: '/bg/role/saveMenuPrivilege',
    method: 'post',
    data
  }, options)
}