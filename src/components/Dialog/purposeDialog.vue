<template>
    <el-dialog class="" title="请填写下载用途" width="600px" :show-close="false" :visible.sync="showModal">
        <div slot="title" class="title">请填写下载用途</div>
        <el-form ref="form" :model="purpParam" :rules="rules" :inline="true" >
            <el-form-item label="下载用途" prop="downPuerpos" class="load-item" label-width="100px">
                <el-input v-model="purpParam.downPuerpos" :autosize="{ minRows: 4}" type="textarea" maxlength="20" style="width:400px;"></el-input>
                <span class="el-form-item__formtip">{{purpParam.downPuerpos.length}}/20</span>
            </el-form-item>
        </el-form>
        <div slot="footer" class="footer">
          <div class="footer-button" @click="cancel">取消</div>
          <div class="footer-button" @click="confirm">确认</div>
        </div>
    </el-dialog>
</template>
<script>
export default {
    name:'purposeDialog',
    data(){
        return {
            showModal:false,
            purpParam:{
                downPuerpos:''
            },
            rules:{
                "downPuerpos":[
                    { required:true, validator:(rules,value,callback)=> {
                        let { downPuerpos } = this.purpParam;
                        if(!downPuerpos){
                            return callback(new Error('请输入下载用途'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ]
            },
            hasDowned:false,
        }
    },
    methods:{
        confirm(){
            this.$refs.form.validate(valid => {
                if(valid){
                    this.$emit('confirm',this.purpParam.downPuerpos)
                }
            })
        },
        cancel(){
            this.hide();
        },
        hide(){
            this.$refs.form.clearValidate();
            if(this.hasDowned){
                this.$refs.form.resetFields();
            }
            this.showModal = false; 
            this.hasDowned = false;
        },
        show(){
            this.showModal = true;
        },
        setDowned(){
            this.hasDowned = true;
        },
    },
}
</script>
<style lang="scss" scoped>
.title{
    text-align: center;
}
.footer{
    text-align: right;
}
.el-form-item__formtip{
  margin-left: 10px;
}
.load-item {}
.footer-button{
    display:inline-block;
    width: auto;
    padding: 5px 12px;
}
</style>