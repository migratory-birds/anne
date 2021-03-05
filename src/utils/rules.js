let validator ={
    isPhone:(rules,value,callback) => {
        let reg = /^[\d]*$/;
        if(value && !reg.test(value)){
            return callback(new Error('手机号码仅支持输入数字'))
        }
        return callback();
    },
    isCardId:(rules,value,callback)=> {
        let reg = /^[0-9a-zA-Z]*$/;
        if(value && !reg.test(value)){
            console.log('90')
            return callback(new Error('身份证号仅支持输入数字及字母'))
        }
        return callback();
    },
    isAccountNo:(rules,value,callback)=> {
        let reg = /^[\d]+$/;
        if(value && !reg.test(value)){
            return callback(new Error('贷款账号仅支持输入数字'))
        }
        return callback();
    },
    isCaseNo:(rules,value,callback)=> {
        let reg = /^[0-9a-zA-Z]*$/;
        if(value && !reg.test(value)){
            return callback(new Error('案件编号仅支持输入数字及字母'))
        }
        return callback();
    },
    isContractNo:(rules,value,callback)=> {
        let reg = /^[0-9a-zA-Z]*$/;
        if(value && !reg.test(value)){
            return callback(new Error('存证编号仅支持输入数字及字母'))
        }
        return callback();
    },
    isApplyNo:(rules,value,callback)=> {
        let reg = /^[0-9a-zA-Z]*$/;
        if(value && !reg.test(value)){
            return callback(new Error('申请编号仅支持输入数字及字母'))
        }
        return callback();
    },
}
export default validator;