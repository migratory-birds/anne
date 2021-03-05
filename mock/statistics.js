
import Mock from 'mockjs';
export default {
    getChartData:() => {
        return Mock.mock({
            'resCode':'000',
            'resMsg':'ok',
            'resData':{
                'downTotalNum':'200',
                'checkTotalNum':'20',
                'contractOperationList':[
                    {
                        'operationDate':'2021-01-01',
                        'downNum':'102',
                        'checkNum':'20',
                        'operatorName':'操作者1'
                    },
                    {
                        'operationDate':'2021-01-02',
                        'downNum':'30',
                        'checkNum':'80',
                        'operatorName':'操作者1'
                    },
                    {
                        'operationDate':'2021-01-03',
                        'downNum':'72',
                        'checkNum':'40',
                        'operatorName':'操作者1'
                    },
                    {
                        'operationDate':'2021-01-04',
                        'downNum':'10',
                        'checkNum':'200',
                        'operatorName':'操作者1'
                    },
                    {
                        'operationDate':'2021-01-05',
                        'downNum':'13',
                        'checkNum':'200',
                        'operatorName':'操作者2'
                    },
                    {
                        'operationDate':'2021-01-06',
                        'downNum':'12',
                        'checkNum':'200',
                        'operatorName':'操作者2'
                    },
                    {
                        'operationDate':'2021-01-07',
                        'downNum':'20',
                        'checkNum':'200',
                        'operatorName':'操作者2'
                    },
                    {
                        'operationDate':'2021-01-08',
                        'downNum':'10',
                        'checkNum':'200',
                        'operatorName':'操作者3'
                    },
                    // {
                    //     'operationDate':'2021-01-09',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'居总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-10',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'热总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-11',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'额总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-12',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'额总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-13',
                    //     'downNum':'10',
                    //     'checkNum':'900',
                    //     'operatorName':'额总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-14',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'的总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-15',
                    //     'downNum':'10',
                    //     'checkNum':'200',
                    //     'operatorName':'是总量'
                    // },
                    // {
                    //     'operationDate':'2021-01-16',
                    //     'downNum':'10',
                    //     'checkNum':'900',
                    //     'operatorName':'去总量'
                    // },


                ]
            },
        })
    }
}