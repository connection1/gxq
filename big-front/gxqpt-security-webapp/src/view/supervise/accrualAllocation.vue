<!-- 权责运行监管配置中心 -->
<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>统一监管平台</BreadcrumbItem>
        <BreadcrumbItem>权责运行监管配置中心</BreadcrumbItem>
      </Breadcrumb>
      <Card style="min-height: 600px;">
        <Form ref="formValidate" inline :label-width="90" :model="serverData">
          <FormItem label="权责类型：">
            <Cascader :data="typeIdData" v-model="serverData.typeIdArr" clearable change-on-select></Cascader>
             <!-- <Input type="text" v-model="serverData.typeId" style="width:140px"></Input> -->
          </FormItem>
          <FormItem label="权责名称：">
             <Input type="text" v-model="serverData.name" style="width:140px" clearable></Input>
          </FormItem>
          <!--<FormItem label="权责编码：">
             <Input type="text" v-model="serverData.code" style="width:140px" clearable></Input>
          </FormItem>-->
          <FormItem label="执行单位：">
            <Select class="queryItem" clearable v-model="serverData.unitId" filterable remote :remote-method="remoteMethod" :loading='loading'>
              <Option v-for="item in unitArr" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="运行状态：">
            <Select class="queryItem" v-model="serverData.runStatus" style="width:80px">
              <Option :value="null">全部</Option>
              <Option :value="true">开启</Option>
              <Option :value="false">禁用</Option>
            </Select>
          </FormItem>
          <FormItem :label-width="20">
            <Button type="primary" @click="search">查询</Button>
            <Button type="primary" @click="addNew">新增</Button>
          </FormItem>
        </Form>
        <hy-table ref="selection" :data="data" :columns="columns" :current="pageOption.pageNo" :total="pageOption.total" :page-size="pageOption.pageSize" @on-change="pageChange" @on-page-size-change="changePageSize" show-sizer border/>
      </Card>
      <Modal v-model="createModal" title="权责清单" width="40%" :mask-closable="false" @on-cancel="cancelFun">
        <Form ref="createForm" :model="createForm" :rules="createRule" :label-width="90">
          <FormItem label="权责类型" prop="typeId">
            <Cascader :data="typeIdData" :clearable="!disa" v-model="createForm.typeIdArr" :disabled="disa" change-on-select></Cascader>
            <!-- <Input type="text" v-model="createForm.typeId"/> -->
          </FormItem>
          <FormItem label="所属系统" prop="systemId">
            <template v-if="!disa">
              <Select class="queryItem" :clearable="!disa" v-model="createForm.systemId" label-in-value :disabled="disa" @on-change="systemChange">
                <Option v-for="item in appArr" :value="item.appId" :key="item.appId">{{ item.name }}</Option>
              </Select>
            </template>
            <template v-else>
              <Input type="text" v-model="createForm.systemName" disabled/>
            </template>
          </FormItem>
          <FormItem label="权责名称" prop="name">
            <Input type="text" v-model="createForm.name" :disabled="disa"/>
          </FormItem>
          <FormItem label="权责编码" prop="code">
            <Input type="text" v-model="createForm.code" :disabled="disa"/>
          </FormItem>
          <FormItem label="执行单位" prop="unit">
            <Select class="queryItem" ref="createFormUnit" :clearable="!disa" v-model="createForm.unit" :disabled="disa" filterable remote :remote-method="remoteMethod" :loading='loading'>
              <Option v-for="item in unitArr" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="责任事项" prop="matter">
            <Input type="textarea" v-model="createForm.matter" :disabled="disa"/>
          </FormItem>
          <FormItem label="运行状态" prop="runStatus">
            <Select class="queryItem" :value="String(createForm.runStatus)" :disabled="disa" @on-change="createForm.runStatus = ($event === 'true')">
              <Option value="true">开启</Option>
              <Option value="false">禁用</Option>
            </Select>
          </FormItem>
          <FormItem label="相关法律法规" prop="lawDesc">
            <Input type="textarea" v-model="createForm.lawDesc" :disabled="disa"/>
          </FormItem>
        </Form>
        <div slot="footer" v-if="modelType!='2'">
          <Button class="modalBtn" type="primary" @click="saveHostRoom(modelType)" size="large">确定</Button>
          <Button class="modalBtn" type="default" @click="cancelFun" size="large">取消</Button>
        </div>
        <div slot="footer" v-else>
          <Button class="modalBtn" type="default" @click="cancelFun" size="large">关闭</Button>
        </div>
      </Modal>
    </Content>
  </Layout>
</template>

<script>
  import api from '@/api/axiosApi'
  import comApiList from '@/api/comApiList'
  import superviseApiList from '@/api/superviseApiList'
  import { mapState } from 'vuex'
  function getCreateForm() {
    return {
      typeIdArr:[],
      typeId:'',//权责类型
      systemId:'',//所属系统ID
      systemName:'',//所属系统名称
      name:'',//权责名称
      code:'',//权责编码
      unit:'',//执行单位
      matter:'',//责任事项
      runStatus:true,//运行状态
      lawDesc:'',//相关法律法规
    }
  }
  export default {
    data() {
      return {
        title:this.$store.state.title,
        typeIdData:[],//权责类型
        appArr:[],//系统列表
        serverData: { //查询参数
          appIds:[],
          typeIdArr:[],
          typeId:"",
          code:"",
          name: "",
          unit:'',
          unitId:"",
          runStatus:null
        },
        modelType:'0',//0新增，1修改，2详情
        createForm:{
          typeIdArr:[],
          typeId:'',//权责类型
          systemId:'',//所属系统ID
          systemName:'',//所属系统名称
          name:'',//权责名称
          code:'',//权责编码
          unit:'',//执行单位
          matter:'',//责任事项
          runStatus:true,//运行状态
          lawDesc:'',//相关法律法规
        },
        unitArr:[],//执行单位列表
        unitIdArr: [],
        createModal:false,
        createRule: {
          typeId: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              console.log(this.createForm.typeIdArr);
              if (this.createForm.typeIdArr.length==0) {
                cb(new Error('权责类型不能为空'))
                return
              }
              cb()
            }
          }],
          systemId: [{required: true, message: '所属系统不可为空', trigger: 'change'}],
          name: [{required: true, message: '权责名称不可为空', trigger: 'blur'}, {max: 64,required: false, message: '请不要输入超过64字的权责名称', trigger: 'blur'}],
          code: [{required: true, message: '权责编码不可为空', trigger: 'blur'}, {max: 20,required: false, message: '请不要输入超过20字的权责编码', trigger: 'blur'}],
          matter: [{max: 200, message: '请不要输入超过200字的责任事项描述', trigger: 'blur' }],
          lawDesc: [{max: 500, message: '请不要输入超过500字的法律法规描述', trigger: 'blur' }],
          unit: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              console.log(this.createForm.unit);
              if (this.createForm.unit=='' || !this.createForm.unit) {
                cb(new Error('执行单位不可为空'))
                return
              }
              cb()
            }
          }],
          runStatus: [{
            required: true,
            trigger: 'blur',
            validator: (rule, value, cb) => {
              console.log(this.createForm.runStatus);
              if (this.createForm.runStatus==undefined) {
                cb(new Error('请选择运行状态！'))
                return
              }
              cb()
            }
          }],
        },
        columns: [{
            type: 'index',
            title: '序号',
            width: 60,
            align: 'center'
          },
          {
            title: '权责类型',
            key: 'typeName'
          },
          {
            title: '权责名称',
            key: 'name'
          },
          {
            title: '所属系统',
						key: 'systemName'
          },
          {
            title: '责任事项',
            key: 'matter',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    width: params.column._width * 0.9 + 'px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  },
                  domProps: {
                    title: params.row.matter
                  }
                }, params.row.matter)
              ])
            }
          },
          {
            title: '执行单位',
            key: 'unitName'
          },
          {
            title: '相关法律法规',
            key: 'lawDesc',
            render: (h, params) => {
              return h('div', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    width: params.column._width * 0.9 + 'px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  },
                  domProps: {
                    title: params.row.lawDesc
                  }
                }, params.row.lawDesc)
                // h('Tooltip', {
                //   props: { placement: 'top' }
                // }, [
                //   h('span', {
                //     style: {
                //       display: 'inline-block',
                //       width: params.column._width * 0.9 + 'px',
                //       overflow: 'hidden',
                //       textOverflow: 'ellipsis',
                //       whiteSpace: 'nowrap'
                //     }
                //   }, params.row.lawDesc),
                //   h('span', {
                //     slot: 'content',
                //     style: { whiteSpace: 'normal', wordBreak: 'break-all' }
                //   }, params.row.lawDesc)
                // ])
              ])
            }
          },
          {
            title: '运行状态',
            key: 'runStatus',
            render: (h, params) => {
              return h('span', (params.row.runStatus) ? "开启" : "禁用")
            }
          },
          // {
          //  title: '创建时间',
          //  width: 220,
          //  align: 'center',
          //  key: 'createTime'
          // },
          {
            title: '操作',
            key: 'act',
            width: 300,
            render: (h, params) => {
              const allocation = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                // style: {
                //  display:this.checkButton('hardware_bmyh_fwqgl_pzbg')?'inline-block':'none'
                // },
                on: {
                  click: () => {//跳转到环节配置
                    this.$router.push({
                      name: 'linkConfiguration',
                      params: {params: params.row}
                    })
                  }
                }
              }, '环节配置');
              const detail = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                // style: {
                //  display:this.checkButton('hardware_bmyh_fwqgl_xq')?'inline-block':'none'
                // },
                on: {
                  click: () => {
                    this.gotoCtrl(2, params.index)
                  }
                }
              },"详情");
              const edit = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                // style: {
                //  display:this.checkButton('hardware_bmyh_fwqgl_xq')?'inline-block':'none'
                // },
                on: {
                  click: () => {
                    this.gotoCtrl(1, params.index)
                  }
                }
              },"修改");
              const del = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                // style: {
                //  display:this.checkButton('hardware_bmyh_fwqgl_xq')?'inline-block':'none'
                // },
                on: {
                  click: () => {
                    this.itemDelete(params.row.id,params.index);
                  }
                }
              },"删除");
              return h('div', [allocation, detail,edit, del]);
            }
          }
        ],
        data: [],
        pageOption: { //分页参数
          pageNo: 1,
          total: 0,
          pageSize: 10
        },
        sysVal: "",
      }
    },
    mounted() {
      this.init();
      console.log(this.$store.state);
    },
    methods: {
      init(){//初始化
        this.findOrgByPower();//获取执行单位列表
        this.getTreeData();//查询权责类型
        this.fwlbByAdmin();//查询系统列表
      },
      fwlbByAdmin() {//查询我所管理的所有启用的应用或服务(1：应用；2：服务)
        api(comApiList.findAppIdListByPt, {
          type: 1
        }).then((res) => {
          if (res.status == 200 && res.data.data) {
          this.appArr = res.data.data
          this.appArr.forEach(item=>{
            this.serverData.appIds.push(item.appId)
          })
        }
      }, (err) => {
          //dong something...
        })
      },
      systemChange (res) {
        const vm = this
        if(res.value){
          vm.createForm.systemName = res.label
          vm.createForm.systemId = res.value
        }else{
          vm.createForm.systemName = ''
          vm.createForm.systemId = ''
        }
      },
      handleChange(value, selecteddata) {
        if(selecteddata.length>0){
          let val = selecteddata.map(o => o.value).reverse();
          this.serverData.system = val[0];
        }else{
          this.serverData.system = "";
        }
      },
      pageChange(num) { //页码改变的回调
        if (!num) return;
        this.pageOption.pageNo = num;
        this.getAccrualPage();
      },
      changePageSize(num) { //切换每页条数时的回调
        if (!num) return;
        this.pageOption.pageSize = num;
        this.getAccrualPage();
      },
      // 获取权责类型树结构
      getTreeData() {
        const vm = this
        api(superviseApiList.findPowerSuperviseTypeTree, {id: '',}).then(res => {
          if (res.data.errcode === 0) {
              this.typeIdData = res.data.data;
              this.typeIdData = JSON.parse(JSON.stringify(this.typeIdData).replace(/name/g, 'label'));
              this.typeIdData = JSON.parse(JSON.stringify(this.typeIdData).replace(/id/g, 'value'));
              console.log(this.typeIdData);
          }
        }, error => {console.log(error)})
      },
      findOrgByPower() {
        api(superviseApiList.findOrgByPower).then((res) => {
          if (res.status == 200 && res.data.data) {
            this.unitArr = res.data.data;
            this.unitArr.forEach(item=>{
              this.unitIdArr.push(item.id)
            })
            this.serverData.unit = this.unitIdArr
            this.getAccrualPage();//查询权责配置分页
          }
        }, (err) => {
          //dong something...
        })
      },
      getAccrualPage() { // 查询服务分配管理分页
        this.data = [];
        var formData = {
          "data": { ...this.serverData
          }, //Object.assign({}, this.searchCondition),
          "pageNo": this.pageOption.pageNo,
          "pageSize": this.pageOption.pageSize
        };
        console.log(formData);
        api(superviseApiList.getAccrualPage, formData).then((res) => {
          if(res.status == 200 && res.data.data) {
            this.data = res.data.data.list;
            this.pageOption.pageSize = res.data.data.pageSize;
            this.pageOption.total = res.data.data.total;
            this.pageOption.pageNo = res.data.data.pageNum;
            if(this.data.length>0){
              this.data.forEach(item=>{//时间格式化
                item.createTime = item.createTime.replace("-","年");
                item.createTime = item.createTime.replace("-","月");
                item.createTime = item.createTime.replace(" ","日 ");
              })
            };
            console.log(this.data);
          }
        }, (err) => {
          //dong something...
        })
      },
      search() {
        console.log(this.serverData.unit)
        this.serverData.unit = [];
        this.pageOption.pageNo=1;
        this.serverData.typeId = this.serverData.typeIdArr[this.serverData.typeIdArr.length-1];
        (!this.serverData.unitId) ? this.serverData.unit = this.unitIdArr : this.serverData.unit.push(this.serverData.unitId)
        console.log(this.serverData);
        this.getAccrualPage();
      },
      addNew(){
        console.log("新增");
        this.createModal = true;
        this.modelType = '0';
        this.$refs.createForm.resetFields();
        this.$refs.createFormUnit.clearSingleSelect()        
      },
      saveHostRoom(){
        console.log(this.modelType);
        let url = '';
        (this.modelType=='0') ? url = superviseApiList.saveAccrualPage : url = superviseApiList.updateAccrualPage;
        this.createForm.typeId = this.createForm.typeIdArr[this.createForm.typeIdArr.length-1];
        console.log(this.createForm);
        this.$refs['createForm'].validate((valid) => {
          if(valid) {
            api(url, this.createForm).then((res) => {
              if(res.status == 200 && res.data.data) {
                if(res.data.data && res.data.errmsg == 'ok'){
                  let msg = (this.modelType=='0') ? '保存成功！' : '编辑成功！';
                  this.$Message.success(msg);
                  this.getAccrualPage();
                  this.$refs.createFormUnit.clearSingleSelect()
                  this.createModal = false;
                }else{
                  this.$Message.error(res.data.errmsg);
                  this.createModal = true;
                }
              }else{
                this.$Message.error(res.data.errmsg);
                this.createModal = true;
              }
            });
            
          }
        })
      },
      itemDelete(id,idx) {//删除
        const vm = this
        vm.$Modal.confirm({
          title: '删除确认',
          content: '确认删除此权责吗？',
          onOk: () => {
            api(superviseApiList.deleteAccrualPage, {id: id}).then(res => {
              if (res.data.errcode === 0) {
                vm.$Message.success('删除成功！')
                vm.modal = false;
                vm.data.splice(idx, 1)
              }else{
                vm.$Message.error(res.data.errmsg)
              }
            }, error => {console.log(error)})
          }
        })
      },
      // 操作
      gotoCtrl (type, idx) {
        this.idx = idx;// 修改和详情
        console.log(this.unitArr)
        this.$refs.createForm.resetFields();
        const data = JSON.parse(JSON.stringify(this.data[idx]))
        this.createForm = {...getCreateForm(), ...data};
        console.log(data)
        this.createForm.typeIdArr = this.systemLoopTree(this.typeIdData);
        this.createModal = true;
        (type==1) ?　this.modelType='1' : this.modelType='2';
      },
      systemLoopTree(r) {
        let _this = this;
        let istrue = [];
        if(!r || r.length == 0) {
          return [];
        };
        let systemRow = [];
        r.forEach(function(value, index) {
          let isChildOrg = true;
          if(!value.children || value.children.length == 0){
            isChildOrg = false;
          };
          if(isChildOrg){
            istrue = _this.systemLoopTree(value.children);
          };
          // if(value.label==_this.createForm.typeId){//后续更换成名称
          if(value.value==_this.createForm.typeId){//后续更换成名称
            systemRow.push(value.value);
          };
          if(istrue.length>0){
            systemRow.push(value.value);
            for(let j in istrue){
              systemRow.push(istrue[j]);
            }
          }
          return [];
        });
        return systemRow;
      },
      checkButton(code){
        if(this.authButton.indexOf(code) >= 0){
          return true;
        }else{
          return false;
        }
      },
      cancelFun () {
        this.$refs.createForm.resetFields();
        this.$refs.createFormUnit.clearSingleSelect(); // 清空单选项
        this.createModal = false
      }
    },
    computed: {
      ...mapState([
        'authButton'
      ]),
      disa(){
        return(this.modelType=="2") ?  true : false;
      }
    },
  }
</script>

<style lang='less' scoped>
  .ivu-btn-small {
    margin: 0 3px;
  }
  .handle{
    color:red;
    cursor: pointer;
  }
  .queryItem {
    width: 100%;
  }
  .access-list {
    span.handle {
      margin: 0 5px;
      display: inline-block;
      cursor: pointer;
      &:hover {
        color: #57a3f3;
      }
    }
  }
</style>
