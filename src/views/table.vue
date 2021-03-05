<template>
<!-- table每列自适应内容宽度展示 -->
<el-table :key="key" :data="data"  v-loading="loading" style="width: 100%;" >
      <el-table-column v-for="fruit in formThead"
        :key="fruit.prop"
        :label="fruit.label"
        :width="fruit.width">
        <template slot-scope="scope">
          {{ scope.row[fruit.prop] }}
        </template>
    </el-table-column>
</el-table>
</template>
<script>
const fields = [
    {label:"ID", prop:"id"},
    {label:"存证名称", prop:"asset_name"},
    {label:"OA工单号", prop:"oa_jon_num"},
    {label:"IP", prop:"ipaddress"},
    {label:"SO号", prop:"sn"},
    {label:"CPU(核)", prop:"cpu"},
    {label:"内存(G)", prop:"memory"},
    {label:"存储(G)", prop:"disk"},
    {label:"资产类型", prop:"device_type_name"},
    {label:"资产状态", prop:"device_status_name"},
    {label:"所属环境", prop:"device_env_type_name"},
    {label:"房间", prop:"root"},
    {label:"设备用途", prop:"purpose"},
    {label:"机架位", prop:"rack_position"},
    {label:"U位", prop:"u_position"},
    {label:"所属IDC机房", prop:"idc_name"},
    {label:"设备型号", prop:"equipment_type"},
    {label:"采购日期", prop:"purchase_date"},
    {label:"所属系统类别", prop:"sys_name"},
    {label:"所属二级产品线", prop:"second_name"},
    {label:"所属物理机", prop:"parent_asset_name"},
    {label:"创建时间", prop:"create_at"}
]

export default {
    data() {
        return {
            url: "asset",
            key: 1, // table key
            formThead: fields, // 默认表头 Default header
            data: []
        };
    },
    mounted(){
        this.data = [{
        asset_name: "交换机",
        cpu: null,
        create_at: "2019-12-03",
        device_env_type_id: 1,
        device_env_type_name: "准生产环境0000准生产环境0000",
        device_status_id: 1,
        device_status_name: "上架",
        device_type_id: 1,
        device_type_name: "物理服务器",
        disk: null,
        equipment_type: null,
        id: 10,
        idc: null,
        ipaddress: null,
        latest_date: null,
        memory: null,
        oa_jon_num: null,
        parent_asset: null,
        purchase_date: null,
        purpose: null,
        rack_position: null,
        root: null,
        second_business: null,
        sn: null,
        switch: null,
        sys_type: null,
    },{
        asset_name: "交换机",
        cpu: null,
        create_at: "2019-12-03",
        device_env_type_id: 1,
        device_env_type_name: "准生产环境0000准生产环",
        device_status_id: 1,
        device_status_name: "上架",
        device_type_id: 1,
        device_type_name: "物理服务器",
        disk: null,
        equipment_type: null,
        id: 10,
        idc: null,
        ipaddress: null,
        latest_date: null,
        memory: null,
        oa_jon_num: null,
        parent_asset: null,
        purchase_date: null,
        purpose: null,
        rack_position: null,
        root: null,
        second_business: null,
        sn: null,
        switch: null,
        sys_type: null,
    },
    {
        asset_name: "交换机",
        cpu: null,
        create_at: "2019-12-03",
        device_env_type_id: 1,
        device_env_type_name: "准生产环境0000准生产环产环境0000准生产环",
        device_status_id: 1,
        device_status_name: "上架",
        device_type_id: 1,
        device_type_name: "物理服务器",
        disk: null,
        equipment_type: null,
        id: 10,
        idc: null,
        ipaddress: null,
        latest_date: null,
        memory: null,
        oa_jon_num: null,
        parent_asset: null,
        purchase_date: null,
        purpose: null,
        rack_position: null,
        root: null,
        second_business: null,
        sn: null,
        switch: null,
        sys_type: null,
    },]
    },
    methods: {
        /**
        * 遍历列的所有内容，获取最宽一列的宽度
        * @param arr
        */
        getMaxLength (arr) {
          return arr.reduce((acc, item) => {
            if (item) {
              let calcLen = this.getTextWidth(item)
              if (acc < calcLen) {
                acc = calcLen
              }
            }
            return acc
          }, 0)
        },
        /**
         * 使用span标签包裹内容，然后计算span的宽度 width： px
         * @param valArr
         */
        getTextWidth(str) {
          let width = 0;
          let html = document.createElement('span');
          html.innerText = str;
          html.className = 'getTextWidth';
          document.querySelector('body').appendChild(html);
          width = document.querySelector('.getTextWidth').offsetWidth;
          document.querySelector('.getTextWidth').remove();
          console.log('width',width)
          return width;
        }
    },
    watch: {
        /**
         * 监控表格的数据data，自动设置表格宽度
         * @param valArr
         */
        data(valArr) {
            const _this = this
            this.formThead = fields.map(function (value) {
                const arr = valArr.map(x => x[value.prop])  // 获取每一列的所有数据
                arr.push(value.label)  // 把每列的表头也加进去算
                value.width = _this.getMaxLength(arr) + 30 // 每列内容最大的宽度 + 表格的内间距(依据实际情况而定)
                console.log('value',value)
                return value
            })
        }
    }
}
</script>