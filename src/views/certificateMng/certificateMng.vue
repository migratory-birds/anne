<template>
<!-- 存证查询 -->
<div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">存证查询</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="客户姓名" prop="userName">
                <el-input v-model="queryParam.userName" placeholder="请填写客户姓名" maxlength="10" clearable></el-input>
            </el-form-item>
             <el-form-item label="身份证号" prop="cardId">
                <el-input v-model="queryParam.cardId" placeholder="请填写客户身份证号" maxlength="18" clearable></el-input>
            </el-form-item>
            <el-form-item label="手机号码" prop="phoneNo">
                <el-input v-model="queryParam.phoneNo" placeholder="请填写客户手机号码" maxlength="11" clearable></el-input>
            </el-form-item>
            <el-form-item label="客户编号">
                <el-input v-model="queryParam.userId" placeholder="请填写客户编号" maxlength="16" clearable></el-input>
            </el-form-item>
            <br/>
            <el-form-item label="存证名称">
                <el-input v-model="queryParam.contractName" placeholder="请填写存证名称" maxlength="20" clearable></el-input>
            </el-form-item>
            <el-form-item label="存证编号" prop="contractNo">
                <el-input v-model="queryParam.contractNo" placeholder="请填写存证编号" maxlength="30" clearable></el-input>
            </el-form-item>
            <el-form-item label="存证状态">
                <el-select v-model="queryParam.contractStatus" placeholder="请选择存证状态">
                    <el-option v-for="item in contractStatusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="案件编号" prop="caseNo">
                <el-input v-model="queryParam.caseNo" placeholder="请填写案件编号（BO号）" maxlength="20" style="width:200px;" clearable></el-input>
            </el-form-item>
            <br/>
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
            <el-form-item label="逾期天数" prop="overDueDayMin">
                <el-input v-model="queryParam.overDueDayMin" placeholder="最小逾期天数" maxlength="10" class="form-input-inline" style="width:120px"></el-input>
                <span> 天 - </span>
                <el-input v-model="queryParam.overDueDayMax" placeholder="最大逾期天数" maxlength="10" class="form-input-inline" style="width:120px"></el-input>
                <span> 天</span>
            </el-form-item>
            <br/>
            <el-form-item label="更新时间" prop="dataOptions">
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
            <el-button type="primary" v-if="hasPerm('queryContractList')" @click="query('',1)" round>查询</el-button>
        </el-form>
    </div>
    <div class="panel">
        <div class="panel-operation-container pagination-wrap">
            <div v-show="tabelData.length > 0" v-if="hasPerm('downloadContract')" class="panel-operation-container-selectAll">
                <el-checkbox v-model="isSelectAll" @change="selectAll">全选</el-checkbox><span class="panel-operation-container-selectAll-c">共选中{{ multiSelection.length }}条记录</span>
                <el-button type="primary" @click="batchLoad" round size="small">批量下载</el-button>
            </div>
            <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
        </div>
        <div class="table-container">
        <el-table ref="table" :data="tabelData" @cell-click="cellclick" :cell-style="tableCellStyle" border height="400" style="width:auto"  empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="contractTable">
			<el-table-column label="" width="120" v-if="hasPerm('downloadContract') || hasPerm('contractDetail')" fixed>
                <el-table-column type="selection" v-if="hasPerm('downloadContract')" label="选择" width="60" label-class-name="hideSelection"></el-table-column>
                <el-table-column v-if="hasPerm('contractDetail')" label="操作" width="70">
                    <template slot-scope="scope">
                        <a class="list-ctrl" :class="{ 'hadView':scope.row.hadView }" @click="view(scope.row.fileId,scope.$index)">查看</a>
                    </template>
                </el-table-column>
            </el-table-column>
			<el-table-column label="存证信息" width="auto">
                <el-table-column label="序号" width="50" prop="index"></el-table-column>
                <el-table-column label="存证名称" width="170">
                    <template slot-scope="scope">
                        <a class="list-ctrl" @click="view(scope.row.fileId)">{{ scope.row.contractName | noNull }}</a>
                    </template>
                </el-table-column>
                <el-table-column  prop="contractNo" label="存证编号" width="210">
                    <template slot-scope="scope">
                        <a class="list-ctrl" @click="view(scope.row.fileId)">{{ scope.row.contractNo }}</a>
                    </template>
                </el-table-column>
                <el-table-column  prop="contractStatus" label="存证状态" width="120">
                    <template slot-scope="scope">
                         {{ getNameByKey(statusMap,scope.row.contractStatus) }}
                    </template>
                </el-table-column>
                <el-table-column label="更新时间" width="180">
                    <template slot-scope="scope">
                        {{ scope.row.updateTime | noNull }}
                    </template>
                </el-table-column>
            </el-table-column>
			<el-table-column label="贷款信息">
                <el-table-column label="申请编号" width="220">
                    <template slot-scope="scope">
                        {{ scope.row.applyNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="贷款账号" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.accountNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="案件编号" width="220">
                    <template slot-scope="scope">
                        {{ scope.row.caseNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column prop="overDueDay" :render-header="dHeader" width="150">
                    <template slot-scope="scope">
                        {{scope.row.overDueDay?`${scope.row.overDueDay}天`: '--'}}
                    </template>
                </el-table-column>
                <el-table-column label="产品名称" width="160">
                    <template slot-scope="scope">
                        {{ scope.row.productName | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="产品编码" width="120">
                    <template slot-scope="scope">
                        {{ scope.row.productNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="渠道号" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.channelNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="渠道名称" width="120">
                    <template slot-scope="scope">
                        {{ scope.row.channelName | noNull }}
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="客户信息" width="auto">
                <el-table-column  prop="userNo" label="客户编号" width="150" fixed></el-table-column>
                <el-table-column  prop="userName" label="客户姓名" width="120"> </el-table-column>
                <el-table-column prop="cardId" label="身份证号" width="220"></el-table-column>
                <el-table-column prop="phoneNo" label="手机号码" width="150"></el-table-column>
            </el-table-column>
        </el-table>
        </div>
        

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
import validator from '@/utils/rules';
import { shortcuts,StatusMap,cdownLoadUrl,cUploadUrl,cbatchDownloadUrl,contractStatusList } from '@/utils/constant';
import { downLoadFile,formatDate,deepCopy } from '@/utils/index';
import TipsDialog from '@/components/Dialog/tipsDialog';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import { contractList } from '@/api/quickSearch';
import { Message } from "element-ui";
import Pagination from '@/components/Pagination/index';
import Mixin from '@/views/mixins/mixin';
import pagiMix from '@/views//mixins/pagiMix';
import batchDownLoadFile from '@/views/mixins/batchDownLoadFile';
import { cFileCheck } from '@/api/protocolMng';
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
                customerIdNumber:'',
                phoneNo:'',
                userId:'',
                contractNo:'',
                contractName:'',
                contractStatus:'',
                caseNo:'',
                accountNo:'',
                applyNo:'',
                channelNo:'',
                productName:'',
                productNo:'',
                overDueDayMin:'',
                overDueDayMax:'',
                updateTimeStart:'',
                updateTimeEnd:'',
                dataOptions: []
            },
            queryCount:0,//点击查询按钮次数
            uploadUrl:cUploadUrl,
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
                "contractNo":[
                    { validator:validator.isContractNo,trigger:['blur','change'] }
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
                        if(value && intValue>= intOverdueDayMax){
                            return callback(new Error('最小逾期天数不得大于最大逾期天数'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
                "dataOptions":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(!value || !value[0] || !value[1]){
                            return callback(new Error('请选择更新开始时间和结束时间'))
                        }
                        if(value[0] > value[1]){
                            return callback(new Error('结束时间不可早于开始时间'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
            },
            datePickerOptions:{
                shortcuts: shortcuts
            },
            tabelData:[],
            statusMap:StatusMap,
            failcount:0,
            succount:0,
            contractStatusList:[],
        }
    },
    computed:{
        ...mapState({
            permission_btns: state => state.permission.btns
        }),
        channelNoList(){
            let origData = this.$store.state.common.channelNoList
            let data = [{channelNo:'查询全部',channelName:'查询全部'}].concat(origData)
            return data;
        },
    },
    mounted(){
        this.getPickerList();
        this.init();
        console.log('mounted query')
        this.query();
    },
    methods:{
        getPickerList(){
            this.$store.dispatch('getChannelList');
            this.contractStatusList = contractStatusList.concat([{ id:'all',name:'查询全部'}])
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
            this.queryParam.updateTimeStart = getZeroTime(new Date().getTime() - 3600 * 1000 * 24 * 6);
            this.queryParam.updateTimeEnd = getEndTime(new Date().getTime());
            this.queryParam.dataOptions = [this.queryParam.updateTimeStart, this.queryParam.updateTimeEnd]
            this.queryParam.channelNo = '';
            this.queryParam.contractStatus = 'all';
        },
        downLoadExample(){
            downLoadFile(cdownLoadUrl,{},'get');
        },
        getPar(list,pageNum){
            if(pageNum){
                this.paginationParam.pageNum  = pageNum;
            }
            let queryParam;
            // if(!list){
                queryParam = deepCopy(this.queryParam);
                queryParam.updateTimeStart =  formatDate(this.queryParam.updateTimeStart);
                queryParam.updateTimeEnd = formatDate(this.queryParam.updateTimeEnd);
                queryParam.channelNo = this.queryParam.channelNo == '查询全部'?'':this.queryParam.channelNo;
            // }
            if(queryParam.contractStatus == 'all'){
                queryParam.contractStatus = ''
            }
            console.log('queryParam',queryParam)
            let params ={
                pageNum:this.paginationParam.pageNum,
                pageSize:this.paginationParam.pageSize,
                list:list ||[{...queryParam}],
                uploadReq:list?true:false,
            }
            console.log('pa',params)
            return params;
        },
        async query(list,pageNum){
            if(list){
                this.getAjax(list,pageNum);
            } else {
                this.validateData(list,pageNum);
            }
        },
        async getAjax(list,pageNum){
            try {
                let params = this.getPar(list,pageNum)
                // console.log('params certificatin',params)
                let res = await contractList(params)
                this.tabelData = res.resData.list;
                this.paginationParam.total = res.resData.total;
                this.tabelData.forEach((item,index)=> {
                    item.hadView = false;
                    // console.log('tb index',index,self.paginationParam.pageNum,typeof self.paginationParam.pageNum)
                    item.index = (this.paginationParam.pageNum - 1) * this.paginationParam.pageSize + (index + 1);
                })
                this.queryCount +=1;
                localStorage.setItem('cmQC',this.queryCount);
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
            this.tipsDialog.showCancel = true;
            this.tipsDialog.cancelTxt = '查看详情';
            let contractList = this.getContractList()
            this.batchDownLoadFile(cbatchDownloadUrl,{downPuerpos:purpose,fileType:'2',contractList },'post')
        },
        getContractList(){
            let contractList  =[]
            this.selectRow.forEach(row => {
                let item = {};
                let { fileId,contractNo,caseNo } = this.tabelData[row];
                item.fileId = fileId;
                item.contractNo = contractNo;
                item.caseNo = caseNo;
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
        getIDs(){
            let idArr = []
            for(let i=0;i<this.tabelData.length;i++){
                idArr.push(this.tabelData[i].fileId)
            }
            return idArr;
        },
        async view(id,index){
            let par = {
                fileId:id
            }
           cFileCheck(par).then(res => {
            if(res.resCode && res.resCode === '2000'){
                //跳转协议查看
                this.gotoDetail(id,index);
            }
           })
        },
        gotoDetail(id,index){
            if(index !== undefined){
                this.tabelData[index].hadView = true;
            }
            let los = 'cmCreID'
            localStorage.removeItem(los);
            localStorage.setItem(los,JSON.stringify(this.getIDs()));
            let account = this.$store.state.user.username;
            var { href } = this.$router.resolve({
                path: '/fileDetail',
                query: {
                    docid: id,
                    queryCount:this.queryCount,
                    type:'certification',
                    store:los,
                    cname:'cmQC',
                    account:account,
                    permission_btns: this.permission_btns,
                    downLoadPermission: 'downloadContract',
                    detailPermission: 'contractDetail'
                }
            });
            let sonWin = window.open(href, '_blank');
        },
        eHeader(h, { column, $index },index){
           return h('span', {}, [
            h('span', {}, '存证信息'),
            h('el-tooltip',
                { props:{style:'position:absolute;right:0;',class:'item',effect:'dark',placement:'top'}},
                [
                    h('div',{ slot:'content',class:'bg78' },[
                        h('p',{},'协议可查范围:'),
                        h('p',{},'1、截止当前时刻，自营渠道已签署协议数据'),
                        h('p',{},'2、截止前一日，第三方渠道已签署协议数据'),
                    ]),
                    h('i',{ class:'el-icon-question'})
                ]
            )
           ])
        },
        dHeader(h, { column, $index },index){
           return h('span', {}, [
            h('span', {}, '逾期天数'),
            h('el-tooltip',
                { props:{style:'position:absolute;right:0;',class:'item',effect:'dark',placement:'top'}},
                [
                    h('div',{ slot:'content',class:'bg78' },[
                        h('p',{},'逾期天数为当前日期前一天的统计结果。'),
                    ]),
                    h('i',{ class:'el-icon-question table-msg'})
                ]
            )
           ])
        },
        handleImport(){
            document.getElementById('importFiles').click();
        },
    },
    watch: {
        'queryParam.dataOptions': {
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
.table-container{
    padding-bottom: 20px;
}
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
.active .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after{
    content:''!important;
}
</style>