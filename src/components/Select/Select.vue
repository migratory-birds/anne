<template>
  <div class="select">
      <div class="label" :style="{ width:`${labWid}px`}">{{ label }} ：</div>
      <div class="input-container" :style="{ width:`${InputWid}px`}">
            <div class="input-suffix" >
                <input v-model="innerVal" class="input_inner" type="text" readonly="readonly" :placeholder="placeholder" @click="handlePicker" @blur="outterBlur"  :class="{'is-focus':isfocus}"/>
                <span class="suffix" :class="{'is-reverse':isReverse}"></span>
            </div>
      
            <div v-show="isDropDown" class="scroll-wrap" id="scroll-wrap" @mouseenter="enterDropList" @mouseleave="leaveDropList">
                <div class="dropdown_wrap dropdown__list">
                    <div v-for="(item,index) in options" :key="index" class="dropdown__item" :class="{'is-select':options[index].state}">
                        <input type="checkbox"   :checked="options[index].state" class="check_input" @blur="innerBlur" @input="input(index)" @click="boxClick(index)"/>
                        <span>{{ item.name }}</span>
                    </div>
                </div>
            </div>
      </div>
  </div>
</template>

<script>
export default {
    name:'picker',
    props:{
        value: {
          default: ''
        },
        label:{
            type:String,
            default:'协议类型'
        },
        labWid:{
            type:String,
            default:100
        },
        InputWid:{
            type:String,
            default:470
        },
        placeholder:{
            type:String,
            default:'请选择'
        },
        options:{
            type:Array,
            default(){
                return [];
            }
        }
    },
    data(){
        return {
            isReverse:false,
            isDropDown:false,
            isChecking:false,
            enter:false,
            isfocus:false,
            isSelect:false,
            innerVal:'查询全部',
            isAll:false,
            idArr:[]
        }
    },
    watch:{
        value(list){
            if(list.indexOf('all') > -1){
                this.init()
            }
        }
    },
    mounted(){
        setTimeout(()=> {
            this.init()
        },500)
    },
    methods:{
        init(){
            this.selectedAll();
            this.showVal()
        },
        handlePicker(e){
            console.log(e);
            this.isDropDown =  true;
            this.isReverse = true;
            this.isfocus = true;
        },
        innerBlur(){
            // console.log('innerBlur')
            if(!this.enter){
                this.isfocus = false;
                this.isDropDown =  false;
                this.isReverse = false;
            }  
        },
        outterBlur(){
            // console.log('outterBlur')
            if(!this.enter){
                this.isDropDown =  false;
                this.isfocus = false;
                this.isReverse = false;
            } 
        },
        enterDropList(){
            this.enter = true;
        },
        leaveDropList(){
            this.enter = false;
        },
        input(index){
            // console.log('index',index)
        },
        handleSelect(idx){
            this.options[idx].state = !this.options[idx].state;
            let includeAll = this.idArr.includes('all');
            if(this.options[idx].state){
                //选中，则push进数组
                this.idArr.push(this.options[idx].id);
                if(!includeAll && this.idArr.length === this.options.length -1){
                    this.options.forEach(item => {
                        item.state = true;
                         if(!this.idArr.includes(item.id)){
                    this.idArr.push(item.id);
                }
                        // this.idArr.push(item.id);
                    })
                    this.isAll = true;
                }
            } else {
                //取消选中，则在数组中删除
                this.isAll = false;
                // console.log('删除idArr',idx,this.options[idx].id,this.idArr)
                let cancelitem = this.idArr.find(item => item == this.options[idx].id)
                let index = this.idArr.indexOf(cancelitem);
                // console.log('index',index,cancelitem,cancelitem)
                this.idArr.splice(index,1);
                if(includeAll){
                    // console.log('options',this.options)
                    let allIdx = [];
                    this.options.map((item,index)=> {
                        if(item.id == 'all'){
                            allIdx.push(index);
                        }
                    });
                    let arr = this.idArr.filter((item,index)=> {
                        return  item !== 'all'
                    });
                    this.idArr = arr;
                    console.log('==this.idArr',this.idArr)
                    this.options[allIdx].state = false;
                    this.showVal();
                }
            }
        },
        selectedAll(){
            this.isAll = true;
            this.options.forEach(item => {
                item.state = true;
                if(!this.idArr.includes(item.id)){
                    this.idArr.push(item.id);
                }
            });
        },
        handleSelectAll(idx){
            this.options[idx].state = !this.options[idx].state;
            let isSelected = this.options[idx].state
            if(isSelected){
               this.selectedAll();
            } else {
                this.isAll = false;
                this.options.forEach((item,idx) => {
                    item.state = false;
                })
                this.idArr = []
            }
        },
        boxClick(idx){
            let isAll = this.options[idx].id == 'all';
            if(isAll){
                this.isAll = true;
                this.handleSelectAll(idx);
                this.showVal()
            } else {
                this.handleSelect(idx);
                this.showVal()
            }
            const ids = this.getIds()
            this.$emit('input',ids);
        },
        getIds(){
            const ids = this.idArr.filter(i => i.id != 'all' );
            return ids;
        },
        showVal(){
            if(this.isAll){
                this.innerVal = '查询全部';
                return;
            }
            let len = this.idArr.length;
            if(len > 0){
                let id = this.idArr[0];
                let value =''
                let idx = this.options.findIndex(item => item.id == id)
                if(id !== 'all'){
                    value = this.options[idx].name
                } else {
                    value = this.options[idx + 1].name
                }
                if(len == 1){
                    this.innerVal = value;
                } else if(len > 1) {
                    this.innerVal = value + '等'
                }
            } else {
                this.innerVal = '';
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.select{
    display: inline-block;
    margin-bottom: 22px;
}
.input-container{
    position: relative;
    display: inline-block;
    .input-suffix{
        position: relative;
        .suffix{
            position: absolute;
            top:15px;
            right: 10px;
            cursor:pointer;
            width:8px;
            height:8px;
            border-left: 1px solid #C0C4CC;
            border-bottom: 1px solid #C0C4CC;
            transform:rotate(-45deg);
            transition: all .3s;
            &.is-reverse{
                transform: rotateZ(135deg);
            }
        }
     
    }
}
.input_inner{
       &.is-focus{
            border-color: #409EFF;
        }
    cursor:pointer;
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}
.scroll-wrap{
    overflow: hidden;
    margin-bottom: -8px;
    margin-right: -8px;
    // height: 100%;
}
.dropdown_wrap{
    position: absolute;
    max-height: 274px;
    overflow-y: scroll;
    width: 100%;
    min-width: 194px;
    z-index:2032;
    border-radius: 4px;
    margin-bottom:12px;
    margin-top:12px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    background-color: #fff;
}
.dropdown__list{
    padding: 6px 0;
    box-sizing:border-box;
    .dropdown__item{
        font-size: 14px;
        padding: 0 20px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #606266;
        height: 34px;
        line-height: 34px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        cursor: pointer;
        &.is-select{
            color: #409EFF;
            font-weight: 700
        }
        &:hover{
            background-color: #F5F7FA;
        }
        .check_input {
            margin-right: 10px;
            text-overflow: ellipsis;
        }
    }
}
.label{
    display: inline-block;
    text-align: right;
    line-height: 40px;
    vertical-align: middle;
    font-size: 14px;
    color:#606266;
    padding: 0 12px 0 0;
    box-sizing: border-box;
    font-weight: 700;
}

.el-select .el-input.is-focus .el-input__inner {
    border-color: #409EFF;
}
</style>