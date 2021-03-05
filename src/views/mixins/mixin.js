let indexMix = {
    filters:{
        noNull(value){
            if(value){
                return value;
            } else {
                return '--';
            }
        }
    },
    methods:{
        getNameByKey(map,value,returnKey='name',key="id"){
            for(let i = map.length -1;i>= 0;i--){
                if(map[i][key] == value){
                    return map[i][returnKey];
                }
            }
        },
        rollBack(){
            this.tabelData = [];
            this.paginationParam.total = 0;
        },
    }
}

let install = (Vue,options = {}) => {
    Vue.mixin(indexMix);
}

export default {
    install
}