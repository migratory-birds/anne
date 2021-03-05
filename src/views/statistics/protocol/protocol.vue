<template>
<div>
    <!-- <div>协议数据统计</div> -->
    <div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">统计条件</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px" class="form">
            <el-form-item label="操作时间" prop="operationDate">
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
             <el-form-item label="操作人姓名" prop="operationName">
                <el-input v-model="queryParam.operationName" maxlength="10"></el-input>
            </el-form-item>
            <el-form-item label="操作人部门" prop="operationSection">
                <el-select v-model="queryParam.operationSection">
                    <el-option v-for="item in operationSectionList" :key="item.deptNo" :label="item.deptName" :value="item.deptNo"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="操作人角色" prop="operationRole">
                <el-select v-model="queryParam.operationRole">
                    <el-option v-for="item in operationRoleList" :key="item.roleCode" :label="item.roleName" :value="item.roleCode"></el-option>
                </el-select>
            </el-form-item>
            <br/>
        </el-form>
        <div class="proto-q">
            <el-button type="primary" plain @click="reset" round>重置</el-button>
            <el-button type="primary" v-if="hasPerm(buttonPermission)" @click="query()" round>查询</el-button>
        </div>
           
    </div>
        <div class="panel">
            <div class="panel-operation-container barRela">
                <span class="panel-title-b"></span><span class="marl17">统计结果（实时）<el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <p>统计一段时间内在本系统下载或查看<span>{{ queryParam.operationType == '1'?'协议':'存证'}}</span>文件的数量分布</p>
                  <p>（每次下载/查看一份<span>{{ queryParam.operationType == '1'?'协议':'存证'}}</span>计1次）</p>
                </div>
                <i class="el-icon-question table-msg" />
                </el-tooltip></span>
                <div class="panel-title-r switch-container">
                    <el-checkbox-group v-model="queryParam.operationModel" class="check-group">
                        <el-checkbox label="1" :checked="isPickD">下载数量</el-checkbox>
                        <el-checkbox label="2" class="seenum" :checked="isPickC">查看数量</el-checkbox>
                    </el-checkbox-group>
                 
                    <el-switch v-model="queryParam.groupByOperator" class="switch" @change="groupBy"></el-switch><span>按操作人分组展示</span>
                    <div class="group-container">
                        <div class="group" @click="changeGroup('3')" :class="{ 'isActive':queryParam.dateOption == '3','unActive':queryParam.dateOption !== '3'}">按年</div>
                        <div class="group" @click="changeGroup('2')" :class="{ 'isActive':queryParam.dateOption == '2','unActive':queryParam.dateOption !== '2'}">按月</div>
                        <div class="group" @click="changeGroup('1')" :class="{ 'isActive':queryParam.dateOption == '1','unActive':queryParam.dateOption !== '1'}">按日</div>
                    </div>
                </div>
            </div>
            <div ref="charts" class="charts" id="charts"></div>
            <div class="table-container" :style="{ width:`${ tbcWidth +1 }px`,'max-width':`90%`}">
                <el-table :data="tData" border :style="{ width:`${ tbcWidth + 1}px`}">
                    <el-table-column v-for="(item,index) in columnObj" :key="item.code" :prop="item.code" :label="item.label" align="center" :width="index == 0 && queryParam.groupByOperator?150:100" :fixed="index ==0 ? true:false">
                        <template slot-scope="scope">
                            <a v-if="index > 1 && hasPermission" class="list-ctrl" @click="goTo(item.code,scope.row.rowLabel,scope.$index)">{{ scope.row[item.code] }}</a>
                            <span v-else>{{ scope.row[item.code] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import { odShortcuts } from '@/utils/constant';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/legendScroll')
import { contractStatis,getRoleList } from '@/api/statistics';
import { formatDate, deepCopy, getSpanDays } from '@/utils/index';
import { Message } from "element-ui";
export default {
    name:'protocol',
    data(){
        return {
            type:'protocol',
            queryParam:{
                operationType:'1',
                operationDate:[],
                operationName:'',
                operationSection:'',
                operationRole:'',
                operationModel:[],
                dateOption:'',
                groupByOperator:false
            },
            pickerRange:{
                shortcuts: odShortcuts,
            },
            xAxisArr:[],
            downNumArr:[],
            checkNumArr:[],
            chartOptions:{},
            yData:[],
            //不按操作人分组时的数据
            downNumSerie:[],
            checkNumSerie:[],
            //按操作人分组时的数据
            downNumSerieByName:[],
            checkNumSerieByName:[],
            checkFlag:false,
            columnObj:{},
            tData:[],
            recordRow:{},
            byName:{
                downNumArrByName:[],
                checkNumArrByName:[],
                nameArray:[],
                serieByNameData:[]
            },
            contractOperationList:[],//原始数据
            roleList:[],
            hasPermission:false,
            buttonPermission: 'protocolDataStatisticList',
            rules: {
                "operationDate":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(!value || !value[0] || !value[1]){
                            return callback(new Error('请选择开始日期和结束日期'))
                        }
                        if(value[0] > value[1]){
                            return callback(new Error('结束日期不可早于开始日期'))
                        } 
                        const spanDays = getSpanDays(value[0], value[1])
                        if (spanDays > 20) {
                            return callback(new Error('结束时间与开始时间相差天数不可超过20天'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
            },
            daysLen:0,
            par:{},
        }
    },
     computed:{
        operationSectionList(){
            let origData = this.$store.state.common.deptList;
            let data = [{deptNo:'all',deptName:'查询全部'}].concat(origData)
            return data;
        },
        operationRoleList(){
            let origData = this.roleList;
            let data = [{roleCode:'all',roleName:'全部类型'}].concat(origData)
            return data;
        },
        isPickD(){
            return this.queryParam.operationModel.includes('1');
        },
        isPickC(){
            return this.queryParam.operationModel.includes('2');
        },
        tbcWidth(){
            let len =0;
            if(this.queryParam.groupByOperator){
                len = this.columnObj.length * 100 +50;
            } else {
                len = this.columnObj.length * 100;
            }
            return len;
        }
    },
    watch:{
        isPickD(bool){
            if(bool && this.checkFlag){
                this.getYData()
            } else {
                for(let i =this.yData.length - 1;i>=0;i--){
                    if(this.yData[i].type.includes('下载数量')){
                        this.yData.splice(i,1);
                    }
                }
            }
            this.initCharts()
        },
        isPickC(bool){
            if(bool && this.checkFlag){
                this.getYData()
            } else {
                for(let i =this.yData.length - 1;i>=0;i--){
                    if(this.yData[i].type.includes('查看数量')){
                        this.yData.splice(i,1);
                    }
                } 
            }
            this.initCharts()
        },
        'queryParam.operationModel'(arr){
              if(arr.length < 1){
                document.getElementById('charts').removeAttribute('_echarts_instance_');
                document.getElementById('charts').innerHTML ='请至少选择一项统计指标';
            }
        },
        'queryParam.operationDate'(arr){
            if(arr.length > 1){
                let timestamp = (arr[1] - arr[0]);
                console.log('timestamp / (24 * 3600 * 1000)',timestamp / (24 * 3600 * 1000))
                this.daysLen = Math.floor(timestamp / (24 * 3600 * 1000)) + 1;
                console.log('day',this.daysLen)
            }
        },
    },
    mounted(){
        this.getPickerList()
        this.init();
        this.query();
        this.hasPermission = this.canJump(this.$store.state.permission.menu);
    },
    methods:{
        init(){
            this.$set(this.queryParam.operationDate,0,new Date().getTime() - 3600 * 1000 * 24 * 6);
            this.$set(this.queryParam.operationDate,1,new Date().getTime());
            this.queryParam.operationSection = '';
            this.queryParam.operationRole ='all';
            this.$set(this.queryParam.operationModel,0,'1');
            this.$set(this.queryParam.operationModel,1,'2');
            this.queryParam.groupByOperator = '1';
            this.queryParam.dateOption = '1';
            if(this.type === 'protocol'){
                this.queryParam.operationType = '1';
            } else if(this.type === 'certificate'){
                this.queryParam.operationType = '2';
            }
        },
        canJump(list){
            let u;
            let idx = list.findIndex(item => item.urlFlag === 'dataStatistic');
            if(idx > -1){
                let slist = list[idx];
                u = slist.children.findIndex(i => i.urlFlag === 'operationLog')
            }
            if(u > -1){
                return true;
            }
            return false;
        },
        getPickerList(){
            this.$store.dispatch('getDeptList');
            this.getRoleList();
        },
        async getRoleList(){
            let res = await getRoleList();
            this.roleList = res.resData;
        },
        getNameList(){
            let newff = deepCopy(this.contractOperationList);
            let nameArr=[];
            newff.forEach((item,idx,value)=> {
                let name = item.operatorName;
                nameArr.push(name);
            });
            let nameList =Array.from(new Set(nameArr));
            return nameList;
        },
        getDataByName(){
            let dat = deepCopy(this.contractOperationList);
            let sortDateList = this.bubbleSort(dat);
            let nameList = this.getNameList();
            let array = [];//人名数组
            for(let i = 0;i<nameList.length;i++){
                let singleName = sortDateList.filter((item) => {
                    return item.operatorName == nameList[i]
                })
                array.push(singleName)
            }
            let downNumSerie =[];
            let checkNumSerie =[];
            array.forEach(item => {
                let downBySingleName = {
                    operatorName:item[0].operatorName,
                    data:[]
                }
                item.forEach(smallItem => {
                    downBySingleName.data.push(smallItem.downNum);
                })
                // console.log('downBySingleName',downBySingleName)
                let checkBySingleName = {
                    operatorName:item[0].operatorName,
                    data:[]
                }
                item.forEach(smallItem => {
                    checkBySingleName.data.push(smallItem.checkNum);
                })
                downNumSerie.push(downBySingleName)
                checkNumSerie.push(checkBySingleName)
            })
           return { downNumSerie,checkNumSerie }
        },
        getOriginRecordByName(nameList,allList){
            let arrByName =[]
            nameList.forEach(nameItem => {
                let ItemByName = allList.filter(allListItem => {
                    return allListItem.operatorName == nameItem;
                })
                arrByName.push(ItemByName);
                // console.log('arrByName',arrByName)
            });
            return arrByName;
        },
        getPara(){
            let par = deepCopy(this.queryParam)
            let len = par.operationModel.length;
            if(len == 2){
                delete par.operationModel;
            } else {
                par.operationModel = par.operationModel[0]
            }
            if(par.groupByOperator === '1'|| par.groupByOperator === false){
                par.groupByOperator = '1'
            } else{
                par.groupByOperator = '2'
            }
            delete par.operationDate;
            par.operationDateStart = formatDate(this.queryParam.operationDate[0],'YY-MM-DD');
            par.operationDateEnd = formatDate(this.queryParam.operationDate[1],'YY-MM-DD');
            if(par.operationSection == 'all'){
                delete par.operationSection;
            }
            if(par.operationRole == 'all'){
                delete par.operationRole
            }
            // console.log('par',par);
            return par;
        },
        getTotal(d){
            let ca = [];
            let da = [];
            d.forEach(i => {
                ca.push(i.checkNum -0);
                da.push(i.downNum-0)
            })
            const checkTotal = ca.reduce((total,num) => total + num);
            const dowmTotal = da.reduce((total,num) => total + num);
            return { checkTotal,dowmTotal }
        },
        bubbleSort(){
            let fixList = deepCopy(this.contractOperationList);
            let len = fixList.length;
            for(let i =0;i< len -1;i++){
                for(let j=0;j<len - 1- i;j++){
                    if(fixList[j].operationDate < fixList[j + 1].operationDate){
                        let temp = fixList[j];
                        fixList[j]  = fixList[j + 1];
                        fixList[j +1]  = temp;
                    }
                }
            }
            return fixList;
        },
        getRowByName(dt){
            let nameList = this.getNameList();
            let list = this.contractOperationList;
            let rowByNameList = this.getOriginRecordByName(nameList,list);
            let recordRowByName = []
            let checkByName = []
            rowByNameList.forEach(ni => {
                let { dowmTotal,checkTotal } = this.getTotal(ni);
                ni.forEach(si => {
                    console.log('si operatorName',si)
                    let oDate = si.operationDate;
                    console.log('oDdate',oDate)
                    if(recordRowByName[`${si.operatorName}-下载数量`]){
                        recordRowByName[`${si.operatorName}-下载数量`][oDate] = si.downNum;
                    }else{
                        recordRowByName[`${si.operatorName}-下载数量`] ={}
                        recordRowByName[`${si.operatorName}-下载数量`]['rowLabel'] = `${si.operatorName}-下载数量`;
                        recordRowByName[`${si.operatorName}-下载数量`]['sum'] = dowmTotal;
                        recordRowByName[`${si.operatorName}-下载数量`][oDate] = si.downNum;
                    }
                    if(checkByName[`${si.operatorName}-查看数量`]){
                        checkByName[`${si.operatorName}-查看数量`][oDate] = si.checkNum;
                    }else{
                        checkByName[`${si.operatorName}-查看数量`] ={}
                        checkByName[`${si.operatorName}-查看数量`]['rowLabel'] = `${si.operatorName}-查看数量`;
                        checkByName[`${si.operatorName}-查看数量`]['sum'] = checkTotal;
                        checkByName[`${si.operatorName}-查看数量`][oDate] = si.checkNum;
                    }
                })
            });
            return { recordRowByName,checkByName};
        },
        getRow(dt){
            this.contractOperationList.map(item => {
                //表数据处理
                let oDate = item.operationDate;
                if(this.recordRow['下载数量']){
                    this.recordRow['下载数量'][oDate] = item.downNum;
                    this.recordRow['下载数量']['sum'] = dt.downTotalNum;
                }else{
                    this.recordRow['下载数量'] ={}
                    this.recordRow['下载数量']['rowLabel'] = '下载数量';
                    this.recordRow['下载数量']['sum'] = dt.downTotalNum;
                    this.recordRow['下载数量'][oDate] = item.downNum;
                }
                if(this.recordRow['查看数量']){
                    this.recordRow['查看数量'][oDate] = item.checkNum;
                    this.recordRow['查看数量']['sum'] = dt.checkTotalNum;
                }else{
                    this.recordRow['查看数量'] ={}
                    this.recordRow['查看数量']['rowLabel'] = '查看数量';
                    this.recordRow['查看数量']['sum'] = dt.checkTotalNum;
                    this.recordRow['查看数量'][oDate] = item.checkNum;
                }
            });
            console.log('recordRow',this.recordRow)
            return this.recordRow;
        },
        query(){
            if(this.daysLen > 20){
                Message({
                  message: '操作时间的结束与开始相差天数不可超过20天',
                  type: 'error',
                  duration: 4 * 1000
                })
                return;
            }
            this.par = this.getPara();
            contractStatis(this.par).then(res => {
                let dt = res.resData;
                this.contractOperationList = dt.contractOperationList;
                let self = this;
                //清空历史数据，以免数据重新渲染
                this.xAxisArr = [];
                this.yData = [];
                this.tData = []; 
                this.checkNumArr = [];
                this.downNumArr = [];
                //表数据处理
                this.columnObj = [
                    { label:'分组维度',code:'rowLabel'},
                    { label:'合计值',code:'sum'},
                ]
                let dat = deepCopy(this.contractOperationList);
                let sortDateList = this.bubbleSort(dat);
                sortDateList.forEach(item => {
                    if(!self.xAxisArr.includes(item.operationDate)){
                        self.xAxisArr.push(item.operationDate);
                    }
                    let Len = item.operationDate.split('-').length;
                    if(Len == 3){
                        let datelabel = item.operationDate;
                        let weekdays = self.weekDays(item.operationDate);
                        datelabel +=`(${weekdays})`;
                    }
                    if(this.par.groupByOperator == '1'){
                        self.downNumArr.push(item.downNum);
                        self.checkNumArr.push(item.checkNum);
                    }
                })
                this.contractOperationList.forEach(item=> {
                    let datelabel = item.operationDate;
                       let col =  {label:datelabel,code:item.operationDate};
                    if(JSON.stringify(self.columnObj).indexOf(JSON.stringify(col)) == -1){
                        self.columnObj.push(col);
                    }
                })
                if(this.par.groupByOperator === '2'){
                    let {recordRowByName,checkByName} = this.getRowByName(dt);
                    Object.keys(recordRowByName).map(item => {
                        this.tData.push(recordRowByName[item])
                    });
                    Object.keys(checkByName).map(item => {
                        this.tData.push(checkByName[item])
                    });
                } else {
                    let  recordRow = this.getRow(dt);
                    Object.keys(recordRow).map(item => {
                        this.tData.push(recordRow[item])
                    }) 
                }
                console.log('this.tData',this.tData)
                //组装y-value值
                this.getYData()
                this.checkFlag = true;
                if(this.queryParam.operationModel.length < 1){
                    document.getElementById('charts').removeAttribute('_echarts_instance_');
                    document.getElementById('charts').innerHTML ='请至少选择一项统计指标';
                    return;
                }
                this.initCharts(); 
            }); 
        },
        getYData(){
            let self = this;
            let par = this.getPara();
            if(par.groupByOperator == '2'){
                let { downNumSerie,checkNumSerie } = this.getDataByName();
                self.downNumSerieByName = [];
                if(this.queryParam.operationModel.includes('1')){//下载
                    downNumSerie.map(item => {
                        let downNumSerieItem ={
                            operatorName:item.operatorName,
                            type:item.operatorName+'-下载数量',
                            isShow:true,
                            data:item.data,
                        }
                        self.downNumSerieByName.push(downNumSerieItem);
                        self.yData.push(downNumSerieItem)
                    })
                }
             
                self.checkNumSerieByName = []
                if(this.queryParam.operationModel.includes('2')){//查看
                    checkNumSerie.map(item => {
                        let checkNumSerieItem ={
                            operatorName:item.operatorName,
                            type:item.operatorName+'-查看数量',
                            isShow:true,
                            data:item.data,
                        }
                        self.checkNumSerieByName.push(checkNumSerieItem);
                        self.yData.push(checkNumSerieItem)
                    })
                }
            } else {
                if(this.queryParam.operationModel.includes('1')){//下载
                    this.downNumSerie = {
                        type:'下载数量',
                        isShow:true,
                        data:this.downNumArr
                    }
                    this.yData.push(this.downNumSerie)
                    console.log('checkNumArr',this.checkNumArr)
                }
                if(this.queryParam.operationModel.includes('2')){//查看
                    this.checkNumSerie = {
                        type:'查看数量',
                        isShow:true,
                        data:this.checkNumArr
                    }
                    this.yData.push(this.checkNumSerie);
                }
            } 
        },
        plainP(list){
             for(let key in list){
                let qKey = list[key];
                let type = Object.prototype.toString.call(qKey);
                if(type === "[object Array]"){
                    list[key] = [];
                } else if ( type === "[object Object]"){
                    this.plainP(qKey);
                } else if (type=== "[object Boolean]"){
                    list[key] = false;
                } else {
                    list[key] = '';
                }
            }
        },
        reset(){
            this.plainP(this.queryParam);
            this.init();
        },
        changeGroup(val){
            this.queryParam.dateOption = val;
            this.query()
        },
        weekDays(date){
            let Len = date.split('-').length;
            let days;
            if(Len == 3){
                let day =new Date(date).getDay();
                var arr = ['日','一','二','三','四','五','六',]
                days = arr[day];
            }
            return `周${days}`;
        },
        initCharts(){
            let charts = echarts.init(this.$refs.charts);
            let self = this;
            const legendData = this.getLegendData();
            this.chartOptions ={
                grid:{
                    x:50,
                    right:50
                },
                tooltip:{
                    trigger:'axis',
                    backgroundColor:'#242C3B',
                    position: function (point, params, dom, rect, size) {
                        // 固定在顶部
                        return [point[0], '-30%'];
                    },
                    formatter:(obj) => {
                        console.log('开始')
                        let str = `<div class="tooltip-container"><div class="chart-tips">${obj[0].axisValue}`;
                        let Len = obj[0].axisValue.split('-').length;
                        if(Len == 3){
                            let weekday = self.weekDays(obj[0].axisValue);
                            str += ` (${weekday})</div>`;
                        }
                        let dialogData ={
                            down:{
                                isShow:false,
                                idx:0,
                            },
                            check:{
                                isShow:false,
                                idx:0,
                            },
                        }
                        let downobj =  []
                        let checkobj =  [];
                        let groupBy = self.queryParam.groupByOperator;
                        // console.log('=========obj',obj)
                        obj.forEach((item,index,arr) => {
                            if(item.seriesName.includes('下载数量')){
                                dialogData.down.isShow = true;
                                dialogData.down.idx = index;
                                if(groupBy == '2'||groupBy === true){
                                    let name = item.seriesName
                                    let has = downobj.some(i => i.seriesName === name);
                                    if(!has){
                                        downobj.push(item);
                                    }
                                }
                            }
                            if(item.seriesName.includes('查看数量')){
                                dialogData.check.isShow = true;
                                dialogData.check.idx = index;
                                if(groupBy == '2'||groupBy === true){
                                    let name = item.seriesName
                                    let has = checkobj.some(i => i.seriesName === name);
                                    if(!has){
                                        checkobj.push(item);
                                    }
                                }
                            }
                        })
                        let downStr='',checkStr='';
                        if(dialogData.down.isShow){
                            if(groupBy == '2'||groupBy === true){ 
                                for(let i=0;i<downobj.length;i++){
                                   downStr+=`<div class="tooltip-number">${downobj[i].seriesName}：<span class="number">${downobj[i].value}次</span></div>`;
                                }
                            } else {
                                downStr=`<div class="tooltip-number">下载数量：<span class="number">${obj[dialogData.down.idx].value}次</span></div>`
                            }
                        }
                        if(dialogData.check.isShow){
                            if(groupBy == '2'||groupBy === true){
                                for(let i=0;i<checkobj.length;i++){
                                    checkStr+=`<div class="tooltip-number check-number">${checkobj[i].seriesName}：<span class="number">${checkobj[i].value}次</span></div>`;
                                }
                            } else {
                                checkStr=`<div class="tooltip-number check-number">查看数量：<span class="number">${obj[dialogData.check.idx].value}次</span></div>`
                            }
                        }
                        if(groupBy == '2'||groupBy === true){
                            if(self.queryParam.operationModel.includes('1')){
                                str = str + downStr;
                            }
                            if(self.queryParam.operationModel.includes('2')){
                                str = str + checkStr;
                            }
                            return str;
                        } else {
                            if(dialogData.down.isShow){
                                str = str + downStr;
                            }
                            if(dialogData.check.isShow){
                                str = str + checkStr;
                            }
                            return str;
                        }
                    }
                },
                legend:{
                    data:legendData,
                    origent:'vertical',
                    x:'center',
                    y:'bottom',
                    type:'scroll'
                },
                xAxis:{
                    type:'category',
                    data:self.xAxisArr,
                    axisLabel:{
                        interval:0,
                        // rotate:30
                    },
                    axisTick:{
                        alignWithLabel:true
                    }
                },
                yAxis:{
                    type:'value',
                    axisTick:{
                        show:false
                    },
                    axisLine:{
                        show:false
                    }
                },
                series:function(){
                    let serie = [];
                    self.yData.forEach((element,index) => {
                        if(self.yData[index].isShow){
                            let item0 =  {
                                type:'line',
                                data:self.yData[index].data,
                                name:self.yData[index].type,
                            }
                            serie.push(item0);
                        }
                    });
                    // console.log('series',serie)
                    return serie;
                }()
            };
            charts.setOption(this.chartOptions,true)
        },
        //获取图标数组
        getLegendData(){
            let legend = []
            this.yData.forEach(yItem =>{
                legend.push(yItem.type);
            })
            return legend;
        },
        groupBy(isGoup){
            this.downNumArr = [];
            this.checkNumArr = [];
            this.query()
        },
        goTo(date,operatorName,idx){
            // idx 0下载，1查看
            // console.log('<operatorName>-',operatorName,this.queryParam.groupByOperator)
            let name;
            let groupByOperator= this.queryParam.groupByOperator;
            if(groupByOperator == '2' || groupByOperator){
                console.log('1')
                let arr = operatorName.split('-');
                name = arr[0];
            }
            this.$router.push({
                name:'log',
                params:{
                    groupByOperator:groupByOperator,
                    date,//日期
                    // value,//取值
                    // numType:typeMap[idx],//下载数量还是查看数量
                    operationType: this.queryParam.operationType, // 操作对象 1协议，2存证
                    operationMode: idx ? '2' : '1', // 操作方式  1下载，2查看
                    tab:'A',
                    qName:this.par.operationName,
                    qSection:this.par.operationSection,
                    qRole:this.par.operationRole == 'all'?'':this.par.operationRole,
                    operationName:name
                }
            })
        },
        pushDataByName(type){
            let self = this;
            switch(type){
                case 'down':
                    this.downNumSerieByName.forEach(c => {
                        self.yData.push(c);
                    });
                    console.log('downNumSerieByName',this.downNumSerieByName)
                    break;
                case 'check':
                    this.checkNumSerieByName.forEach(c => {
                        self.yData.push(c);
                    });
                    console.log('checkNumSerieByName',this.checkNumSerieByName)

                    break;
                default:
                    return;
            }
        },
    },
}
</script>
<style lang="scss" scoped>
.proto-q{
    text-align: left;
    padding-left: 1190px;
    padding-bottom: 24px;
}
.barRela{
    position: relative;
}
.marl17{
    margin-left: 17px;
    font-size: 16px;
}
.panel-title-r{
    position: absolute;
    right: 34px;
    top:0;
}
.switch-container{
    color: #424B5D;
    font-size: 14px;
    .seenum{
        margin-right: 24px;
    }
    .switch{
        margin-right: 10px;
        margin-top: -5px;
    }
}
.group-container{
    display: inline-block;
    margin-left: 14px;
    .group{
        display: inline-block;
        width: 57.2px;
        height: 23.3px;
        line-height: 23.3px;
        text-align: center;
        border:1px solid #2986FD;
        font-size: 14px;
        cursor:pointer;
    }
    .group:nth-child(1){
        border-right: 0!important;
    }
    .group:nth-child(3){
        border-left: 0;
    }
    .isActive{
        background-color: #2986FD;
        color: #fff;
    }
    .unActive{
        background-color: #fff;
        color:#2986FD ;
    }
}
.charts{
    width: 1650px;
    min-height: 380px;
    max-height: 750px;
    // line-height: 350px;
    padding: 20px 0;
    box-sizing: content-box;
    text-align: center;
}
.table-container{
    // width:80%;
    margin-left: 90px;
    margin-right: 20px;
    padding-bottom: 60px;
}
</style>
<style>
.check-group{
    display:inline-block;
}
.tooltip-container{
    min-width:227px;
}
.chart-tips{
    text-align: left;
    padding: 5px;
    padding-left: 20px;
    font-size: 14px;
    line-height: 40px;
    color:rgba(161, 169, 184, 1);
    border-bottom: 1px solid #353F51; 
}
.number{
    color:rgba(161, 169, 184, 1);  
}
.tooltip-number{
    text-align: left;
    padding-top: 10px;
    padding-left: 20px;
}
.check-number:last-child{
    padding-bottom: 15px;
}
.form .el-date-editor .el-range-separator{
    width: 9%;
}
</style>