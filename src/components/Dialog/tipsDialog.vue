<template>
    <el-dialog class="tipsDialog" title="" width="400px" :show-close="false" :visible.sync="showModal">
        <div slot="title" class="title">温馨提示</div>
        <div class="content">
            <slot name="content" ></slot>
        </div>
        
        <div class="footer">
          <div @click="confirm" class="footer-b footer-b-l"  :class="{'twoCell':showCancel}">{{ confirmTxt }}</div>
          <div v-if="showCancel" @click="cancel" class="footer-b"  :class="{'twoCell':showCancel,'footer-b-r':showCancel}">{{ cancelTxt }}</div>
        </div>
    </el-dialog>
</template>
<script>
export default {
    name:'tipsDialog',
    props:{
        showCancel:{
            type:Boolean,
            default:false
        },
        confirmTxt:{
            type:String,
            default:'我知道了'
        },
        cancelTxt:{
            type:String,
            default:'查看详情'
        },
    },
    data(){
        return {
            showModal:false,
        }
    },
    methods:{
        confirm(){
            this.hide();
            this.$emit('confirm');
        },
        cancel(){
            this.hide();
            this.$emit('cancel');
        },
        hide(){
            this.showModal = false;
        },
        show(){
            this.showModal = true;
        },
    },
}
</script>
<style lang="scss" scoped>
.title,.footer{
    text-align: center;
}
.content {
    padding: 20px 30px;
}
.el-dialog__footer{
    border:1px solid #ccc;
}
.twoCell{
    width: 50%;
    color: #ccc;
    text-align: center;
    border-right:1px solid #ccc;
}

.footer{
    border-top: 1px solid #ccc;
}
.footer-b-r{
    color:#409EFF;
}
.footer-b{
    display: inline-block;
    text-align: center;
    height: 50px;
    line-height: 50px;
}
</style>
<style lang="scss">
.tipsDialog{
    .el-dialog__body{
        padding: 0!important;
    }   
} 
</style>