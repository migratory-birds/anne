import axios from "axios";
export default {
    name:'pagiMix',
    data(){
        return {
            tabelData:[],
            isSelectAll:false,
            multiSelection:[],
            paginationParam:{
                total:0,
                pageNum:1,
                pageSize:10
            },
            selectRow:[],
            tipsDialog:{
                cancelTxt:'',
                showCancel:false,
                tipsContent:'',
            },
            row:'',
            column:'',
        }
    },
    watch:{
        multiSelection(data){
            this.selectRow = []
            if (data.length > 0) {
                data.forEach((item, index) => {
                    this.selectRow.push(this.tabelData.indexOf(item))
                })
            }
        },
    },
    created(){
        let my = this;
        document.onkeydown = function(e){
            let key = window.event.keyCode;
            if(key == 13){
                my.query()
            }
        }
    },
    methods:{
        batchLoad(){
            let len = this.multiSelection.length;
            if(len < 1){
                this.tipsDialog.tipsContent = '请先至少选择一条记录。'
                this.$refs.TipsDialog.show();
            } else {
                this.$refs.PurposeDialog.show();
            }
        },
        handleSelectionChange(val){
            this.multiSelection  =  val;
            if(this.multiSelection.length < this.tabelData.length){
                this.isSelectAll = false;
            } else {
                this.isSelectAll = true;
            }
        },
        selectedHighlight({ row, rowIndex }){
            if (this.selectRow.includes(rowIndex)) {
                return {
                  'background-color': '#98C5FF',
            }}
        },
        selectAll(){
            if (this.isSelectAll) {
                this.toggleSelection(this.tabelData);
            } else {
                this.toggleSelection();
            }
        },
        toggleSelection(rows){
            this.multiSelection = [];
            if (rows) {
                rows.forEach(row  => {
                this.$refs.table.toggleRowSelection(row, true);});
            } else {
                this.$refs.table.clearSelection();
            }
        },
        handlePagination(data){
            //当前页
            this.paginationParam.pageNum = data.page;
            this.paginationParam.pageSize = data.limit;
            setTimeout(()=> {
                this.query();
            },500);
        },
        cellclick(row, column, cell, event){
            this.row = row;
            this.column = column;
        },
        tableCellStyle(e){
            let isTheCell = e.rowIndex == 0 && e.columnIndex == 1;
            if(isTheCell && this.row == e.rowIndex && this.column  == e.columnIndex){
                return 'color:#ccc;'
            }
        },
        handleUploadError(message){
            // this.tipsDialog.tipsContent = `查询条件${message}有误，请检查文件是否输入正确`;
            this.tipsDialog.tipsContent = message;
            this.tipsDialog.showCancel = false;
            this.$refs.TipsDialog.show();
        },
        uploadExcel(event){
            var formData=new FormData();
            var files = event.target.files || event.dataTransfer.files;
             formData.append('file',files[0]);
             var file = formData
             console.log(file)
            axios.post(this.uploadUrl,file).then((res)=>{
                if(res.data.resCode === '2000'){
                    let list = res.data.resData.list
                    this.query(list,1);
                    let a = ''
                    event.target.value = a;
                } else if(res.data.resCode === '1014'|| res.data.resCode === '1013'){
                    const msg = res.data.resMsg;
                    this.handleUploadError(msg)
                }
            })
        },
        validateData(list,pageNum){
            this.$refs.form.validate(valid => {
                if(valid){
                    console.log('valid',pageNum);
                    this.getAjax(list,pageNum);
                }
            })
        },
    },
}