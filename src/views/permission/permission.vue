<template>
<!-- 权限管理 -->
<div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">角色查询</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
              <el-select v-model="queryParam.roleName" placeholder="请选择角色名称">
                <el-option v-for="(item, index) in roleList" :value="item.roleName" :label="item.roleName" :key="index"></el-option>
              </el-select>
            </el-form-item>
             <el-form-item label="角色编码" prop="roleCode">
              <el-select v-model="queryParam.roleCode" placeholder="请选择角色编码">
                <el-option v-for="(item, index) in roleList" :value="item.roleCode" :key="index"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDateOptions">
                <el-date-picker 
                    v-model="queryParam.createDateOptions" 
                    type="datetimerange" 
                    value-format="timestamp"
                    :default-time="['00:00:00', '23:59:59']"
                    :picker-options="datePickerOptions" 
                    range-separator="至" 
                    start-placeholder="开始时间" 
                    end-placeholder="结束时间">
                </el-date-picker>
            </el-form-item>
            <br/>
            <el-form-item label="更新时间" prop="updateDateOptions">
                <el-date-picker 
                    v-model="queryParam.updateDateOptions" 
                    type="datetimerange" 
                    value-format="timestamp"
                    :clearable="false"
                    :default-time="['00:00:00', '23:59:59']"
                    :picker-options="datePickerOptions" 
                    range-separator="至" 
                    start-placeholder="请选择开始时间" 
                    end-placeholder="请选择结束时间">
                </el-date-picker>
            </el-form-item>
            <el-button type="primary" plain @click="reset" round>重置</el-button>
            <el-button type="primary" @click="query(pageNum)" round>查询</el-button>
        </el-form>

    </div>
    <div class="panel">
        <div class="panel-operation-container pagination-wrap">
            <div class="panel-operation-container-selectAll">
                <el-button @click="handleSync" type="primary" plain round size="small">同步角色信息</el-button>
            </div>
            <Pagination :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
        </div>
        
        <el-table ref="table" :data="tabelData" border max-height="500" style="width:auto"  empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="contractTable">
            <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                    <div>
                      <el-button @click="showDetails(scope.row)" type="text">查看</el-button>
                      <el-button @click="handleEdit(scope.row)" type="text">编辑</el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column  prop="roleCode" label="角色编码" width="220"></el-table-column>
            <el-table-column  prop="roleName" label="角色名称" width="220"> </el-table-column>
            <el-table-column prop="roleDesc" label="角色描述" width="auto" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="220"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="220"></el-table-column>
        </el-table>
    </div>
    <PermissionDetails ref="detailsDialog" :info="info"></PermissionDetails>
    <PermissionEdit @update="query()" ref="editDialog" :info="info"></PermissionEdit>
</div>
</template>
<script>
import validator from '@/utils/rules';
import { shortcuts } from '@/utils/constant';
import Pagination from '@/components/Pagination/index';
import Mixin from '@/views/mixins/mixin';
import pagiMix from '@/views/mixins/pagiMix';
import PermissionDetails from '@/views/permission/permissionHandle/details'
import PermissionEdit from '@/views/permission/permissionHandle/permissionEdit'
import { findRoleByPagination, manualSyncRole, getMenuPrivilegeList } from '@/api/permission'
import { mapState } from 'vuex'
import { formatDate } from '@/utils/index'
import { getZeroTime,getEndTime } from '@/utils/index'
export default {
    name:'quickSearch',
    mixins:[Mixin,pagiMix],
    components:{
        Pagination,
        PermissionDetails,
        PermissionEdit
    },
    computed: {
      ...mapState({
        roleList: state => state.common.roleList
      })
    },
    data(){
        return {
            total: 0,
            queryParam:{
              roleCode:'',   // 角色编码
              roleName: '',   // 角色名称
              createTimeStart: '', // 创建开始时间
              createTimeEnd: '',   // 创建结束时间
              updateTimeStart:'',
              updateTimeEnd:'',
              createDateOptions: [],
              updateDateOptions: [],
              pageNum: 1,
              pageSize: 10
            },
            info: {},
            rules:{
                "updateDateOptions":[
                  { required:true, validator:(rules,value,callback)=> {
                      if(!value || !value[0] || !value[1]){
                          return callback(new Error('请选择开始时间和结束时间'))
                      }
                      if(value[0] > value[1]){
                          return callback(new Error('结束时间不可早于开始时间'))
                      }
                      return callback()
                  }, trigger:['blur','change']}
                ],
                "createDateOptions":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(value && (value[0] > value[1])){
                            return callback(new Error('结束时间不可早于开始时间'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
            },
            datePickerOptions:{
                shortcuts: shortcuts,
                // disabledDate:time => {
                //     let endDate = new Date(this.queryParam.endTime);
                //     if(endDate){
                //         return (time.getTime() > endDate.getTime());
                //     }
                // },
            },
            tabelData:[],
        }
    },
    mounted(){
        this.init();
        this.query()
    },
    methods:{
      init(){
        // 更新时间设置默认值getZeroTime,getEndTime
        this.queryParam.updateTimeStart = getZeroTime(new Date().getTime() - 3600 * 1000 * 24 * 6);
        this.queryParam.updateTimeEnd = getEndTime(new Date().getTime());
        this.queryParam.updateDateOptions = [this.queryParam.updateTimeStart, this.queryParam.updateTimeEnd];
        this.queryParam.createTimeStart = '',
        this.queryParam.createTimeEnd = '', 
        this.queryParam.createDateOptions = [];
        // 获取角色枚举值
        this.$store.dispatch('getRoleList')
      },
      handleQuery() {
        this.queryParam.pageNum = 1;
        this.queryParam.pageSize = 10;
        this.query();
      },
      query(pageNum) {
        if(pageNum){
            this.paginationParam.pageNum  = pageNum;
        }
        this.$refs.form.validate(async valid => {
          if(valid){
            try {
              const updateTimeStart = this.queryParam.updateTimeStart ? formatDate(this.queryParam.updateTimeStart) : '';
              const updateTimeEnd = this.queryParam.updateTimeEnd ? formatDate(this.queryParam.updateTimeEnd) : '';
              const createTimeStart = this.queryParam.createTimeStart ? formatDate(this.queryParam.createTimeStart) : '';
              const createTimeEnd = this.queryParam.createTimeEnd ? formatDate(this.queryParam.createTimeEnd) : '';
              let par = {
                ...this.queryParam,
                updateTimeStart,
                updateTimeEnd,
                createTimeStart,
                createTimeEnd
              }
              par.pageNum = pageNum || par.pageNum;
              const result = await findRoleByPagination(par)
              const data = result.resData;
              this.total = data.total || 0;
              this.tabelData = data.list || []
            } catch (error) {
              console.log('error',error)
              this.rollBack();
            }

          }
        })
      },
      // 查询角色详细信息
      async queryDetails(roleId) {
        this.info = {};
        const result = await getMenuPrivilegeList({ roleId })
        this.info = result.resData || {};
      },
      // 查看
      async showDetails(row) {
        const roleId = row && row.id || ''
        await this.queryDetails(roleId);
        this.$refs.detailsDialog.show();
      },
      // 编辑
      async handleEdit(row) {
        const roleId = row && row.id || ''
        await this.queryDetails(roleId);
        this.$refs.editDialog.show();
      },
      // 同步角色信息
      async handleSync() {
        await manualSyncRole();
        this.query();
      },
      reset(){
        this.$refs.form.resetFields();
        this.init();
      },
  },
  watch: {
    'queryParam.createDateOptions': {
        handler: function(value) {
            if (!value) {
                this.queryParam.createTimeStart = '';
                this.queryParam.createTimeEnd = '';
            } else {
                this.queryParam.createTimeStart = value[0] || '';
                this.queryParam.createTimeEnd = value[1] || ''
            }
        }
    },
    'queryParam.updateDateOptions': {
        handler: function(value) {
            if (!value) {
                this.queryParam.updateTimeStart = '';
                this.queryParam.updateTimeEnd = '';
            } else {
                this.queryParam.updateTimeStart = value[0] || '';
                this.queryParam.updateTimeEnd = value[1] || ''
            }
        }
    }
  }
}
</script>
<style lang="scss" scoped>
.contractTable{
    margin-left: 20px;
    margin-right: 20px;
}
.form-input-inline{
    display: inline-block;
}
.el-table th div.triangle{
    width: 0px;
    height: 0px;
    border-width: 10px 6.3px;
    border-color: transparent transparent rgba(59, 182, 69, 0.68);
    border-style: solid;
    display: inline-block;
}
</style>
<style>
/*表格全选框去除空框*/
.cell.hideSelection  .el-checkbox {
  display: none!important;
  position: relative;
}
/*表格全选框改为：选择*/
.cell.hideSelection:after {
  content: "\9009\62e9";
}
</style>