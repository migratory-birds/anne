<template>
<!-- 快速搜索 -->
<div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">合同查询</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="客户姓名" prop="beginTime">
                <el-input v-model="queryParam.userName" placeholder="请填写客户姓名" maxlength="10" style="width:195px;" clearable></el-input>
            </el-form-item>
             <el-form-item label="身份证号" prop="cardId">
                <el-input v-model="queryParam.cardId" placeholder="请填写客户身份证号" maxlength="18" clearable></el-input>
            </el-form-item>
            <el-form-item label="手机号码" prop="phoneNo">
                <el-input v-model="queryParam.phoneNo" placeholder="请填写客户手机号码" maxlength="11" clearable></el-input>
            </el-form-item>
            <el-form-item label="客户编号">
                <el-input v-model="queryParam.userid" placeholder="请填写客户编号" maxlength="16" clearable></el-input>
            </el-form-item>
            <br/>
            <el-form-item label="案件编号" prop="caseNo">
                <el-input v-model="queryParam.caseNo" placeholder="请填写案件编号（BO号）" maxlength="20" style="width:195px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="贷款账号" prop="accountNo">
                <el-input v-model="queryParam.accountNo" placeholder="请填写贷款账号" maxlength="20" clearable></el-input>
            </el-form-item>
            <el-form-item label="申请编号" prop="applyNo">
                <el-input v-model="queryParam.applyNo" placeholder="请填写申请编号" maxlength="20" clearable></el-input>
            </el-form-item>
            <el-form-item label="渠道号">
                <el-select v-model="queryParam.channelNo" placeholder="查询全部" filterable clearable>
                    <el-option v-for="item in channelNoList" :key="item.channelNo" :label="item.channelNo" :value="item.channelNo"></el-option>
                </el-select>
            </el-form-item>
            <br/>
            <el-form-item label="产品名称">
                <el-select v-model="queryParam.productName" placeholder="查询全部" filterable clearable>
                    <el-option v-for="item in productNameList" :key="item.productNo" :label="item.productName" :value="item.productName"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="产品编码">
                <el-select v-model="queryParam.productNo" placeholder="查询全部" filterable clearable>
                    <el-option v-for="item in productNoList" :key="item.productNo" :label="item.productNo" :value="item.productNo"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="逾期天数" prop="overDueDayMin">
                <el-input v-model="queryParam.overDueDayMin" placeholder="最小逾期天数" maxlength="10" class="form-input-inline" style="width:120px"></el-input>
                <span> 天 - </span>
                <el-input v-model="queryParam.overDueDayMax" placeholder="最大逾期天数" maxlength="10" class="form-input-inline" style="width:120px"></el-input>
                <span> 天</span>
            </el-form-item>
            <br/>
            <el-form-item label="签署时间" prop="dataOptions">
                <el-date-picker 
                    v-model="queryParam.dataOptions" 
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
            <input type="file" id="importFiles" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none" @change="uploadExcel"/>
            <el-button type="primary" @click="handleImport">+导入</el-button>
            <el-button type="primary" @click="downLoadExample">下载模板</el-button>
            <el-button type="primary" plain @click="reset" round>重置</el-button>
            <el-button type="primary" v-if="hasPerm('quickIndexList')" @click="query('',1)" round>查询</el-button>
        </el-form>

    </div>
    <div class="panel">
        <div class="panel-operation-container pagination-wrap">
            <div v-show="tabelData.length > 0" v-if="hasPerm('downloadQuickIndex')" class="panel-operation-container-selectAll">
                <el-checkbox v-model="isSelectAll" @change="selectAll">全选</el-checkbox><span class="panel-operation-container-selectAll-c">共选中{{ multiSelection.length }}条记录</span>
                <el-button type="primary" @click="batchLoad" round size="small">批量下载</el-button>
            </div>
            <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
        </div>
        
        <el-table ref="table" :data="tabelData" @cell-click="cellclick" :cell-style="tableCellStyle" border height="400" style="width:auto"  empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="contractTable">
			<el-table-column label="" width="120" fixed v-if="hasPerm('downloadQuickIndex') || hasPerm('quickIndexDetail')">
                <el-table-column type="selection" v-if="hasPerm('downloadQuickIndex')" label="选择" width="60" label-class-name="hideSelection" ></el-table-column>
                <el-table-column v-if="hasPerm('quickIndexDetail')" label="操作" width="70">
                    <template slot-scope="scope">
                        <a class="list-ctrl" :class="{ 'hadView':scope.row.hadView }" @click="view(scope.row.userNo,scope.row.userName,scope.$index)">查看</a>
                    </template>
                </el-table-column>
            </el-table-column>
			<el-table-column label="客户信息" width="auto">
                <el-table-column  prop="userNo" label="客户编号" width="230"></el-table-column>
                <el-table-column  prop="userName" label="客户姓名" width="auto"> </el-table-column>
                <el-table-column prop="cardId" label="身份证号" width="auto"></el-table-column>
                <el-table-column prop="phoneNo" label="手机号码" width="auto"></el-table-column>
            </el-table-column>
			<el-table-column label="合同信息">
                <el-table-column prop="agreementTotal" label="协议总数" width="auto"></el-table-column>
                <el-table-column label="协议情况" width="120" show-overflow-tooltip>
                    <template slot-scope="scope">
                        {{ scope.row.agreementCondition | noNull }}
                    </template>
                </el-table-column>
                <el-table-column prop="contractTotal" label="存证总数" width="auto"></el-table-column>
                <el-table-column prop="contractCondition" label="存证情况" width="120" show-overflow-tooltip>
                    <template slot-scope="scope">
                        {{ scope.row.contractCondition | noNull }}
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </div>
    <TipsDialog ref="TipsDialog" confirmTxt="我知道了" @cancel="goto" :showCancel="tipsDialog.showCancel" :cancelTxt="tipsDialog.cancelTxt">
        <template v-slot:content>
            {{ tipsDialog.tipsContent }}
        </template>
    </TipsDialog>
    <PurposeDialog ref="PurposeDialog" @confirm="confirmPurpose">
    </PurposeDialog>
</div>
</template>
<script>
import axios from "axios";
import validator from '@/utils/rules';
import { shortcuts,qUploadUrl,qdownLoadUrl,qbatchDownloadUrl } from '@/utils/constant';
import { downLoadFile,deepCopy,formatDate } from '@/utils/index';
import TipsDialog from '@/components/Dialog/tipsDialog';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import { quickIndexList, } from '@/api/quickSearch';
import Pagination from '@/components/Pagination/index';
import Mixin from '@/views/mixins/mixin';
import pagiMix from '@/views//mixins/pagiMix';
import batchDownLoadFile from '@/views/mixins/batchDownLoadFile';
import { mapState } from 'vuex'
import { getZeroTime,getEndTime } from '@/utils/index'

export default {
    name:'quickSearch',
    mixins:[Mixin,pagiMix,batchDownLoadFile],
    components:{
        TipsDialog,
        Pagination,
        PurposeDialog,
    },
    data(){
        return {
            clearable:false,
            queryParam:{
                userName:'',
                cardId:'',
                phoneNo:'',
                userid:'',
                caseNo:'',
                accountNo:'',
                applyNo:'',
                channelNo:'',
                productName:'',
                productNo:'',
                overDueDayMin:'',
                overDueDayMax:'',
                signStartTime:'',
                signEndTime:'',
                dataOptions: [],
            },
            uploadUrl:qUploadUrl,
            file: {
                receiversFile: []
            },
            rules:{
                "cardId":[
                    { validator:validator.isCardId,trigger:['blur','change']}
                ],
                "phoneNo":[
                    { validator:validator.isPhone,trigger:['blur','change'] }
                ],
                "accountNo":[
                    { validator:validator.isAccountNo,trigger:['blur','change'] }
                ],
                "caseNo":[
                    { validator:validator.isCaseNo,trigger:['blur','change'] }
                ],
                "applyNo":[
                    { validator:validator.isApplyNo,trigger:['blur','change'] }
                ],
                "overDueDayMin":[
                    { validator:(rules,value,callback)=> {
                        let { overDueDayMax } = this.queryParam;
                        let reg = /[\d]+/;
                        let intValue = parseInt(value);
                        let intOverdueDayMax =  parseInt(overDueDayMax)
                        if( (value && !reg.test(value)) || (overDueDayMax && !reg.test(overDueDayMax))){
                            return callback(new Error('逾期天数仅支持输入数字'))
                        }
                        if(value && value>= intOverdueDayMax){
                            return callback(new Error('最小逾期天数不得大于最大逾期天数'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
                "dataOptions":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(!value || !value[0] || !value[1]){
                            return callback(new Error('请选择签署开始时间和结束时间'))
                        }
                        if(value[0] > value[1]){
                            return callback(new Error('结束时间不可早于开始时间'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
            },
            datePickerOptions:{
                shortcuts: shortcuts,
            },
            tabelData:[],
        }
    },
    computed:{
        ...mapState({
            permission_btns: state => state.permission.btns
        }),
        channelNoList(){
            let origData = this.$store.state.common.channelNoList;
            let data = [{channelNo:'查询全部',channelName:'查询全部'}].concat(origData)
            return data;
        },
        productNameList(){
            let origData = this.$store.state.common.productNameList;
            let data = [{productNo:'all',productName:'查询全部'}].concat(origData)
            return data;
        },
        productNoList(){
            let origData = this.$store.state.common.productNameList;
            let data = [{productNo:'查询全部',productName:'查询全部'}].concat(origData)
            return data;
        },
    },
    mounted(){
        this.getPickerList();
        this.init();
        this.query()
    },
    methods:{
        getPickerList(){
            // this.$store.dispatch('getDeptList');
            this.$store.dispatch('getProductNameList');
            this.$store.dispatch('getChannelList');
        },
        handlBeforeUpload(file){
            let fd = new FormData();
            fd.append('file',file);
            axios.post(this.uploadUrl,fd,{
                headers:{
                    "Content-type":"application/json",
                },
                timeout:1000 * 60 * 10
            }).then(res => {
                console.log(res)
            })
        },
        renderHeader(h, { column, $index }) {
            return h('div', {attrs: {  style: 'position:relative;' }}, [
                 h('span', {}, '操作'),
                 h('div', { attrs: {  style: 'display:inline-block;' }}, [
                    h('span', { attrs: {  style: 'width: 0px;height: 0px;border-width: 5px 5px;border-color: transparent transparent rgba(59, 182, 69, 0.68);border-style: solid;display: inline-block;',class:'triangle', }}, ''),
                    h('span', { attrs: {  style: 'width: 0px;height: 0px;border-width: 5px 5px;border-color: rgba(59, 182, 69, 0.68) transparent transparent;border-style: solid;display: inline-block;',class:'triangle', }}, ''),
                   ])
                ]
            )
        },
        init(){ 
            this.queryParam.signStartTime = getZeroTime(new Date().getTime() - 3600 * 1000 * 24 * 6);
            this.queryParam.signEndTime = getEndTime(new Date().getTime());
            this.queryParam.dataOptions = [this.queryParam.signStartTime, this.queryParam.signEndTime]
            this.queryParam.channelNo = '';
            this.queryParam.productName = '';
            this.queryParam.productNo = '';
        },
        downLoadExample(){
            downLoadFile(qdownLoadUrl);
        },
        getPar(list,pageNum){
            if(pageNum){
                this.paginationParam.pageNum  = pageNum;
            }
            let queryParam;
            if(!list){
                queryParam = deepCopy(this.queryParam);
                queryParam.signStartTime =  formatDate(this.queryParam.signStartTime);
                queryParam.signEndTime = formatDate(this.queryParam.signEndTime);
                let { productName,channelNo,productNo } = queryParam;
                if(productName == ''||productName == '查询全部'){
                    delete queryParam.productName;
                }
                if(channelNo == ''||channelNo == '查询全部'){
                    delete queryParam.channelNo;
                }
                if(productNo == ''||productNo == '查询全部'){
                    delete queryParam.productNo;
                }
            }
            console.log('queryParam',queryParam)
            let params ={
                pageNum:pageNum || this.paginationParam.pageNum,
                pageSize:this.paginationParam.pageSize,
                list:list || [{...queryParam}],
                uploadReq:list?true:false,
            }
            console.log('pa',params)
            return params;
        },
        query(list,pageNum){
            if(list){
                this.getAjax(list,pageNum);
            } else {
                this.validateData();
            }
        },
        async getAjax(list,pageNum){
            try {
            let params = this.getPar(list,pageNum);
            let res = await quickIndexList(params);
                console.log('res',res)
                this.tabelData = res.resData.list;
                this.tabelData.forEach((item,index) => {
                    item.hadView = false;
                    item.index = (index + 1);
                })
                this.paginationParam.total = res.resData.total;
            } catch (error) {
                console.log('error',error)
                this.rollBack();
            }
        },
        reset(){
            for(let key in this.queryParam){
                this.queryParam[key] = '';
            }
            this.init();
        },
        confirmPurpose(purpose){
            console.log('purpose',purpose)
            this.tipsDialog.showCancel = true;
            this.tipsDialog.cancelTxt = '查看详情';
            let contractList = this.getContractList()
            this.batchDownLoadFile(qbatchDownloadUrl,{downPuerpos:purpose,fileType:'2',contractList },'post')
        },
        getContractList(){
            let contractList  =[]
            this.selectRow.forEach(row => {
                let item = {};
                let { contractIds,protocolIds } = this.tabelData[row];
                item.protocolIds = protocolIds;
                item.contractIds = contractIds
                contractList.push(item)
            });
            return contractList
        },
        goto(){
            //跳转到我的工作台
            this.$router.push({
                name:'workbench'
            })
        },
        view(no,name,index){
            //跳转合同列表页
            console.log('合同列表',no,name)
            // this.$store.commit('SET_KEEP_ALIVE', ['quickSearch'])
            if(index !== undefined){
                this.tabelData[index].hadView = true;
            } 
            this.$store.dispatch('setKeepAlive',['quickSearch'])
            this.$router.push({
                name:'contractList',
                params:{
                    queryParam:this.getPar(),
                    userNo:no,
                    userName:name,
                    permission_btns: this.permission_btns
                }
            })
        },
        handleImport(){
            document.getElementById('importFiles').click();
        },
    },
    watch: {
        'queryParam.dataOptions': {
            handler: function(value) {
                if (!value) {
                    this.queryParam.signStartTime = '';
                    this.queryParam.signEndTime = '';
                } else {
                    this.queryParam.signStartTime = value[0] || '';
                    this.queryParam.signEndTime = value[1] || ''
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
.hadView{
    color:#ccc;
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