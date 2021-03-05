<template>
  <el-dialog title="编辑角色" :visible.sync="dialogVisible" :show-close="false" :center="true" width="700px">
    <el-form ref="dialogForm" :model="formParam" :rules="rules" label-position="left" class="dialog-wrap">
      <el-form-item label="角色名称" class="dialog-form-item">
        <div>{{info.roleName}}</div>
      </el-form-item>
      <el-form-item label="角色编码" class="dialog-form-item">
        <div>{{info.roleCode}}</div>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input v-model="formParam.roleDesc" placeholder="请输入角色描述" class="form-input" maxlength="20" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="角色权限" class="dialog-permisssion-list">
        <div class="permission-check">
          <div class="permission-multi" v-for="(item, index) in menuList" :key="index">
            <div class="permission-items">
              <div class="check-items">
                <el-checkbox :value="item.checked" :checked="item.checked" @change="menuCheckedChange(item, false)">{{item.text}}</el-checkbox>
              </div>
              <el-select v-if="!item.hasChildMenu && item.id !== 1 && item.id !== 9" v-model="item.levelCode" placeholder="请选择">
                <el-option v-for="(btnItem, btnIndex) in item.authLevelList" :key="btnIndex" :value="btnItem.levelCode" :label="btnItem.levelMsg">{{btnItem.levelMsg}}</el-option>
              </el-select>
            </div>
            <div v-if="item.hasChildMenu" class="permission-sub">
              <!-- 屏蔽存证结果统计 -->
              <div class="permission-sub-items" v-for="(child, childIndex) in item.children" v-if="child.id !== 8" :key="childIndex">
                <div class="check-sub-items">
                  <el-checkbox :value="child.checked" :checked="child.checked" @change="menuCheckedChange(child, true, item)">{{child.text}}</el-checkbox>
                </div>
                <el-select v-model="child.levelCode" placeholder="请选择">
                  <el-option v-for="(btnItem, btnIndex) in child.authLevelList" :key="btnIndex" :value="btnItem.levelCode" :label="btnItem.levelMsg">{{btnItem.levelMsg}}</el-option>
                </el-select>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleSubmit" type="primary" plain round style="margin-right: 60px;">保存</el-button>
      <el-button @click="hide" type="primary" plain round>返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { saveMenuPrivilege } from '@/api/permission'
export default {
  name: 'permissionEdit',
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      formParam: {
        id: '',
        roleDesc: '',
        menuIds: '',   // 菜单ID集合, 逗号隔开
        privilegeIds: ''   // 权限ID集合, 逗号隔开
      },
      menuList: [],
      checked: false,
      rules: {

      }
    }
  },
  methods: {
    async handleSubmit() {
      let menuIds = '';
      this.privilegeIds = '';
      this.menuList.forEach(item => {
        if (item.checked) {
          // 拼接菜单id
          if (menuIds) {
            menuIds = `${menuIds},${item.id}`
          } else {
            menuIds = `${item.id}`
          }
          if (item.hasChildMenu) {
            // 拼接子菜单id
            item.children.forEach(childItem => {
              if (childItem.checked) {
                if (menuIds) {
                  menuIds = `${menuIds},${childItem.id}`
                } else {
                  menuIds = `${childItem.id}`
                }
                this.getPrivilegeIds(childItem)
              }
            })
          } else {
            this.getPrivilegeIds(item);
          }
        }
      })
      this.formParam.menuIds = menuIds;
      const result = await saveMenuPrivilege(this.formParam)
      this.hide();
      this.$message({
        message: result.resMsg || '操作成功了',
        type: 'success',
      })
      this.$emit('update')
    },
    // 拼接按钮权限id
    getPrivilegeIds(item) {
      if (item.authLevelList && item.authLevelList.length > 0) {
        item.authLevelList.forEach(buttonItem => {
          if (buttonItem.levelCode === item.levelCode) {
            // 拼接菜单id
            if (this.formParam.privilegeIds) {
              this.formParam.privilegeIds = `${this.formParam.privilegeIds},${buttonItem.privilegeIds}`
            } else {
              this.formParam.privilegeIds = `${buttonItem.privilegeIds}`
            }
          }
        })
      }
    },
    menuCheckedChange(item, childChecked, parent = {}) {
      item.checked = !item.checked;
      if (childChecked) {
        // 子菜单选项状态改变，需联动父级菜单勾选状态
        let hasChildChecked = false
        parent.children.forEach(childItem => {
          if (childItem.checked) {
            hasChildChecked = true
          }
        })
        parent.checked = hasChildChecked;
      } else if (item.children && item.children[0] && item.children[0].type === 1) {
        // 有子菜单，勾选父级，联动改变子菜单勾选
        item.children.forEach(childItem => {
          childItem.checked = item.checked
        })
      }
      // 手动更新menuList，不然视图不会更新
      this.menuList = [...this.menuList]
    },
    init() {
      this.formParam.roleDesc = this.info.roleDesc;
      this.formParam.id = this.info.roleId;
      const list = this.info.privilegeList ? [...this.info.privilegeList] : [];
      this.menuList = list.map(item => {
        // flag: 1=>已选  0=>未选
        item.checked = item.flag === 1;
        const childList = item.children || [];
        let childChecked = false;   // 标识是否有已选子菜单
        childList.forEach(childItem => {
          if (childItem.type === 1) {
            // 子菜单
            item.hasChildMenu = true;  // 标识是否具有子菜单
            childItem.checked = childItem.flag === 1;
            if (childItem.flag === 1) {
              childChecked = true
            }
          }
        })
        if (childChecked) {
          item.checked = true
        }
        return item
      })
    },
    show() {
      this.init();
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
    }
  }
}
</script>

<style lang="scss" scoped>
>>>.el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}
/deep/.el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}
.dialog-wrap {
  padding: 0 30px;
}
.dialog-form-item {
  margin-bottom: 10px;
}
.form-input {
  width: 400px;
}
.dialog-permisssion-list {
  display: flex;
  margin-bottom: 0;
}
.permission-items, .permission-sub-items {
  display: flex;
  margin-bottom: 6px;
  align-items: center;
}
.permission-sub-items::before {
  display: block;
  content: '';
  width: 28px;
  height: 1px;
  background: #95A1B9;
  margin-right: 4px;
}
.permission-multi {
  margin-bottom: 6px;
}

.check-items {
  width: 200px;
}
.check-sub-items {
  width: 160px;
}
.permission-sub {
  position: relative;
  padding-left: 8px;
  &::before {
    display: block;
    content: '';
    width: 1px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 8px;
    background: #95A1B9;
  }
}
</style>
