<template>
<!-- 权限管理 -->
<div @keyup.enter="query">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">查询条件</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="120px">
            <el-form-item label="操作人姓名" prop="userName">
              <el-input v-model="queryParam.userName" maxlength="10"></el-input>
            </el-form-item>
            <el-form-item label="操作人部门" prop="deptNo">
              <el-select v-model="queryParam.deptNo" clearable placeholder="">
                <el-option v-for="(item, index) in deptList" :value="item.deptNo" :label="item.deptName" :key="index">{{item.deptName}}</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="操作人角色" prop="roleNo">
              <el-select v-model="queryParam.roleNo" clearable placeholder="">
                <el-option v-for="(item, index) in roleList" :value="item.roleCode" :label="item.roleName" :key="index">{{item.roleName}}</el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="操作时间" prop="operationDate">
              <!-- <el-date-picker v-model="queryParam.optStartTime" type="date" :picker-options="pickerBegin" placeholder="开始时间" :clearable="clearable"></el-date-picker>
              <span> - </span>
              <el-date-picker v-model="queryParam.optEndTime" type="date" :picker-options="pickerEnd" placeholder="结束时间" :clearable="clearable"></el-date-picker> -->
              <el-date-picker 
                    v-model="queryParam.operationDate" 
                    type="daterange" 
                    value-format="timestamp"
                    :clearable="false"
                    :picker-options="pickerRange" 
                    range-separator="至" 
                    start-placeholder="开始日期" 
                    end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <br/>
            <el-form-item label="操作内容" prop="operationType">
              <el-select v-model="queryParam.operationType" placeholder="请选择">
                <el-option v-for="(item, index) in logContentList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="搜索条件" prop="searchStr">
              <el-input v-model="queryParam.searchStr" placeholder="支持模糊查询" maxlength="20"></el-input>
            </el-form-item>
            <el-button type="primary" plain @click="reset" round>重置</el-button>
            <el-button type="primary" @click="handleQuery" round>查询</el-button>
        </el-form>

    </div>
    <div class="panel">
        <div class="panel-operation-container pagination-wrap">
          <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">查询结果</span></div>
          <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
        </div>
        
        <el-table ref="table" :data="tabelData" border max-height="500" style="width:auto" @sort-change="sortChange" empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="contractTable">
          <el-table-column type="index"  label="序号" width="80"></el-table-column>
          <el-table-column  prop="userName" label="操作人姓名" width="120"></el-table-column>
          <el-table-column  prop="deptNames" label="操作人部门" width="220"> </el-table-column>
          <el-table-column prop="roleName" label="操作人角色" width="auto"></el-table-column>
          <el-table-column prop="operationTime" sortable="custom" :sort-orders="sortOrders" label="操作时间" width="200"></el-table-column>
          <el-table-column prop="operationType" label="操作内容" width="120">
            <template slot-scope="scope">{{scope.row.operationType | filterLogContent}}</template>
          </el-table-column>
          <el-table-column prop="searchStr" label="搜索条件" width="220"></el-table-column>
          <el-table-column prop="spendTime" label="查询时间" width="120"></el-table-column>
          <el-table-column prop="queryResult" label="查询结果" show-overflow-tooltip></el-table-column>
          <el-table-column prop="queryNum" label="查询结果数量" show-overflow-tooltip></el-table-column>
        </el-table>
    </div>
</div>
</template>
<script>
import validator from '@/utils/rules';
import { shortcuts, logContentList } from '@/utils/constant';
import Pagination from '@/components/Pagination/index';
import Mixin from '@/views/mixins/mixin';
import pagiMix from '@/views/mixins/pagiMix';
import { logQueryList } from '@/api/log'
import { formatDate, getZeroTime } from '@/utils/index'
import { mapState } from 'vuex'
export default {
    name:'quickSearch',
    mixins:[Mixin,pagiMix],
    components:{
      Pagination
    },
    computed: {
      ...mapState({
        deptList: state => state.common.deptList,
        roleList: state => state.common.roleList
      })
    },
    data(){
      return {
        clearable: false,
        logContentList,
        paginationParam: {
          total: 0,
          pageNum: 1,
          pageSize: 10
        },
        queryParam:{
          userName: '',
          roleNo: '',    // 操作人角色
          deptNo: '',   // 操作人部门
          optStartTime: '',
          optEndTime: '',
          operationDate: [],
          operationType: '',     // 操作内容对象（1存证，2协议，3快速搜索）
          searchStr: '',   // 搜索条件
          order: '1',   //排序規則(0升序 1降序)
          sortField: 'SFE01'    // 排序字段（SFE01创建时间，SFE02编号）
        },
        sortOrders: ['ascending', 'descending'],
        rules:{
          "operationDate":[
            { required:true, validator:(rules,value,callback)=> {
              if(!value || !value[0] || !value[1]){
                  return callback(new Error('请选择开始日期和结束日期'))
              }
              if(value[0] > value[1]){
                  return callback(new Error('结束日期不可早于开始日期'))
              }
              return callback()
            }, trigger:['blur','change']}
          ],
        },
        pickerRange:{
          shortcuts: shortcuts,
          disabledDate:time => {
              let endDate = new Date(this.queryParam.endTime);
              if(endDate){
                  return (time.getTime() > endDate.getTime());
              }
          },
        },
        pickerEnd:{
          shortcuts: shortcuts,
          disabledDate:time => {
            let beginDate = new Date(this.queryParam.beginTime);
            if(beginDate){
                return (time.getTime() < beginDate.getTime())
            }
          }
        },
        tabelData:[],
      }
    },
    mounted(){
      this.initDefaultTime();
      this.query()
    },
    methods:{
      initDefaultTime(){
        const optStartTime = new Date().getTime() - 3600 * 1000 * 24 * 6;
        // 获取开始时间当天零点的时间戳，不然开始和结束时间为同一天时表单校验不通过
        this.queryParam.optStartTime = getZeroTime(optStartTime)
        this.queryParam.optEndTime = new Date().getTime();
        this.queryParam.operationDate = [this.queryParam.optStartTime, this.queryParam.optEndTime]
      },
      handleQuery() {
        this.paginationParam.pageNum = 1;
        this.paginationParam.pageSize = 10;
        this.query();
      },
      query(){
        this.$refs.form.validate(async valid => {
          if(valid){
            try {
              const optStartTime = this.queryParam.optStartTime ? formatDate(this.queryParam.optStartTime, 'YY-MM-DD') : '';
              const optEndTime = this.queryParam.optEndTime ? formatDate(this.queryParam.optEndTime, 'YY-MM-DD') : '';
              const result = await logQueryList({
                ...this.queryParam,
                optStartTime,
                optEndTime,
                pageSize: this.paginationParam.pageSize,
                pageNum: this.paginationParam.pageNum
              })
              console.log(result)
              this.tabelData = result.resData.list || []
              this.paginationParam.total = result.resData.total || 0
            } catch (error) {
              console.log('error',error)
              this.rollBack();
            }

          }
        })
      },
      sortChange({column, prop, order}) {
        if (order === 'ascending') {
          // 顺序
          this.queryParam.order = '0'
        } else {
          // 倒序，默认倒序
          this.queryParam.order = '1'
        }
        this.handleQuery();
      },
      reset(){
        this.$refs.form.resetFields();
        this.initDefaultTime();
      },
    },
    watch: {
      'queryParam.operationDate': {
        handler: function(value) {
          if (!value) {
            this.queryParam.optStartTime = '';
            this.queryParam.optEndTime = '';
          } else {
            this.queryParam.optStartTime = value[0] || '';
            this.queryParam.optEndTime = value[1] || ''
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
.panel-operation-container {
  display: flex;
}
</style>