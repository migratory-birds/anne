<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :show-close="false" :center="true" width="700px">
    <div class="details-wrap">
      <div class="base-info">
        <div class="base-list">
          <p>角色名称：{{info.roleName}}</p>
          <p>角色编码：{{info.roleCode}}</p>
          <p>角色描述：{{info.roleDesc}}</p>
        </div>
        <div class="base-list">
          <p>创建时间：{{info.createTime}}</p>
          <p>更新时间：{{info.updateTime}}</p>
        </div>
      </div>
      <div class="permission-info">
        <p>角色权限：</p>
        <div class="table-wrap">
          <div class="table-list">
            <span class="table-items-left">权限模块</span>
            <span>权限信息</span>
          </div>
          <!-- 屏蔽存证结果统计 -->
          <div class="table-list" v-for="(item, index) in permissionList" v-if="item.id !== 8" :key="index">
            <span class="table-items-left">{{item.text}}</span>
            <span v-if="item.flag">{{item | filterPermission}}</span>
            <span v-else>--</span>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="hide" type="primary" plain round>返回</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'permissionDetails',
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      }
    },
    title: {
      type: String,
      default: '角色信息'
    }
  },
  computed: {
    permissionList() {
      const list = this.info.privilegeList || []
      const newList = [];
      for (let j=0; j<list.length; j++) {
        let item = list[j];
        if (item.children && item.children[0] && item.children[0].type === 1) {
          // type: 1=> 菜单，2=> 按钮
          for (let i=0; i<item.children.length; i++) {
            newList.push(item.children[i]);
          }
        } else {
          newList.push(item)
        }
      }
      return newList;
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    show() {
      this.dialogVisible = true;
    },
    hide() {
      this.dialogVisible = false;
    }
  },
  filters: {
    filterPermission(obj) {
      const permissionList = obj.authLevelList || [];
      const options = permissionList.filter(item => {
        return item.levelCode === obj.levelCode
      })
      return options[0] ? options[0].levelMsg : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.details-wrap {
  padding: 0 50px;
}
.base-info {
  display: flex;
}
.base-list {
  width: 50%;
  p {
    margin-bottom: 20px;
  }
}
.permission-info {
  margin-top: 20px;
}
.table-wrap {
  border: 1px solid #A1A9B8;
  border-radius: 5px;
  text-align: center;
  margin-top: 10px;
}
.table-list {
  border-bottom: 1px solid #A1A9B8;
  display: flex;
  span {
    display: block;
    height: 50px;
    line-height: 50px;
    text-align: center;
    width: 50%;
    box-sizing: border-box;
  }
  .table-items-left {
    border-right: 1px solid #A1A9B8;
  }
}
.table-list-last {
  border: none;
}
</style>
