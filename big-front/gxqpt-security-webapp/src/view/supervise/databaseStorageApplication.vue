<!-- 数据存储监管配置中心 -->
<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>统一监管平台</BreadcrumbItem>
        <BreadcrumbItem>{{ title }}</BreadcrumbItem>
      </Breadcrumb>
      <Card style="min-height: 600px;">
        <Form ref="formValidate" inline :label-width="110" :model="serverData">
          <FormItem label="应用/服务名称：">
            <Select v-model="serverData.appId" style="width:200px" clearable>
                <Option v-for="item in appArr" :value="item.appId" :key="item.appId">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="监管方式：">
            <Select v-model="serverData.superviseType" style="width:200px" clearable>
                <Option v-for="item in superviseTypeData" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="运行状态：">
            <Select class="queryItem" v-model="serverData.runStatusArr" clearable>
              <Option value="1">开启</Option>
              <Option value="0">禁用</Option>
            </Select>
          </FormItem>
          <FormItem :label-width="20">
            <Button type="primary" @click="search">查询</Button>
            <Button type="primary" @click="addNew">新增</Button>
          </FormItem>
        </Form>
        <hy-table ref="selection" :data="data" :columns="columns" :current="pageOption.pageNo" :total="pageOption.total" :page-size="pageOption.pageSize" @on-change="pageChange" @on-page-size-change="changePageSize" show-sizer border/>
      </Card>
      <Modal v-model="createModal" :title="modelTitle" width="40%" :mask-closable="false">
        <Form ref="createForm" :model="createForm" :rules="createRule" :label-width="120">
          <FormItem label="应用/服务名称" prop="appId">
            <template v-if="!disa">
              <Select v-model="createForm.appId" style="width:200px" :disabled="disa">
                <Option v-for="item in appArr" :value="item.appId" :key="item.appId">{{ item.name }}</Option>
              </Select>
            </template>
            <template v-else>
              <Input type="text" v-model="createForm.appName" disabled/>
            </template>
          </FormItem>
          <FormItem label="预警级别" required style="margin-top: 25px;">
            <Select v-model="createForm.level" :disabled="disa">
                <Option :value="1" >一般</Option>
                <Option :value="2" >较重</Option>
                <Option :value="3" >严重</Option>
                <Option :value="4" >特别严重</Option>
            </Select>
          </FormItem>
          <FormItem label="数据库空间阈值" prop="dbSpaceLimit" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.dbSpaceLimit" :disabled="disa">
              <span slot="append">G</span>
            </Input>
          </FormItem>
          <FormItem label="数据库空间检测地址" prop="dbSpaceUrl" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.dbSpaceUrl"  :disabled="disa" />
          </FormItem>
          <FormItem label="日志空间阈值" prop="logSpaceLimit" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.logSpaceLimit"  :disabled="disa">
              <span slot="append">G</span>
            </Input>
          </FormItem>
          <FormItem label="日志空间检测地址" prop="logSpaceUrl" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.logSpaceUrl"  :disabled="disa" />
          </FormItem>
          <FormItem label="文件空间阈值" prop="fileSpaceLimit" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.fileSpaceLimit"  :disabled="disa">
              <span slot="append">G</span>
            </Input>
          </FormItem>
          <FormItem label="文件空间检测地址" prop="fileSpaceUrl" style="margin-top: 25px;">
            <Input type="text" v-model="createForm.fileSpaceUrl" :disabled="disa" />
          </FormItem>
          <FormItem label="责任人" prop="dutyUser" style="margin-top: 25px;">
            <template v-if="!disa">
              <Select v-model="createForm.dutyUser" ref="dutyUser" clearable filterable :disabled="disa">
                <Option v-for="item in dutyUsers" :value="item.gxqptEmpId" :key="item.gxqptEmpId">{{ item.name }}</Option>
              </Select>
            </template>
            <template v-else>
              <Input type="text" v-model="createForm.dutyUserName" disabled/>
            </template>
          </FormItem>
          <FormItem label="确认人" prop="confirmUser" style="margin-top: 25px;">
            <template v-if="!disa">
              <Select v-model="createForm.confirmUser" filterable multiple :disabled="disa">
                <Option v-for="item in confirmUsers" :value="item.gxqptEmpId" :key="item.gxqptEmpId">{{ item.name }}</Option>
              </Select>
            </template>
            <template v-else>
              <Input type="text" v-model="createForm.confirmUserName" disabled/>
            </template>
          </FormItem>
          <FormItem label="抄送人" prop="copyUser" style="margin-top: 25px;">
            <template v-if="!disa">
              <Select v-model="createForm.copyUser" filterable multiple :disabled="disa">
                <Option v-for="item in copyUsers" :value="item.gxqptEmpId" :key="item.gxqptEmpId">{{ item.name }}</Option>
              </Select>
            </template>
            <template v-else>
              <Input type="text" v-model="createForm.copyUserName" disabled/>
            </template>
          </FormItem>
          <FormItem label="监管方式" prop="superviseType" style="margin-top: 25px;">
            <Select v-model="createForm.superviseType" style="width:200px" :disabled="disa">
                <Option v-for="item in superviseTypeData" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="提醒方式" prop="remindType" style="margin-top: 25px;">
            <Select class="queryItem" :clearable="!disa" multiple v-model="createForm.remindType" :disabled="disa" @on-change="selectChange">
              <Option value="1">消息</Option>
              <Option value="2">短信</Option>
            </Select>
          </FormItem>
          <FormItem label="运行状态" prop="runStatusArr" style="margin-top: 25px;">
            <Select class="queryItem" :clearable="!disa" v-model="createForm.runStatusArr" :disabled="disa">
              <Option value="1">开启</Option>
              <Option value="0">禁用</Option>
            </Select>
          </FormItem>
          <FormItem label="备注" prop="desc" style="margin-top: 25px;">
            <Input type="textarea" v-model="createForm.desc"  :disabled="disa"/>
          </FormItem>
          <!-- <FormItem label="附件报告" style="margin-top: 40px;" prop="file">
            <hy-upload ref="evalReport" multiple :on-success="setEvalReport" :on-remove="removeEvalReport" :before-upload="evalBeforeUpload" :defaultFileList="createForm.attachment"></hy-upload>
          </FormItem> -->
        </Form>
        <div slot="footer" v-if="modelType!='2'">
          <Button class="modalBtn" type="primary" @click="saveHostRoom" size="large">确定</Button>
          <Button class="modalBtn" type="default" @click="createModal = false" size="large">取消</Button>
        </div>
        <div slot="footer" v-else>
          <Button class="modalBtn" type="default" @click="createModal = false" size="large">关闭</Button>
        </div>
      </Modal>
    </Content>
  </Layout>
</template>

<script>
  import api from '@/api/axiosApi'
  import superviseApiList from '@/api/superviseApiList'
  import hyUpload from '@/components/hengyun/hyUpload'
  import { validateNumber } from '@/api/formValidate'
  import {changeTreeData} from '@/assets/js/utils'
  import comApiList from '@/api/comApiList'
  import { mapState } from 'vuex'
  function getCreateForm() {
    return {
      appId:'',//应用名称
      level: 1,//预警级别
      dbSpaceLimit:'',//数据库空间阀值
      dbSpaceUrl:'',//数据库空间地址
      logSpaceLimit:'',//日志空间阀值
      logSpaceUrl:'',//日志空间地址
      fileSpaceLimit:'',//文件空间阀值
      fileSpaceUrl:'',//文件空间地址
      dutyUser:'',//责任人
      confirmUser:[],//确认人
      copyUser:'',//抄送人
      superviseType:0,//监管方式1:实时，2:天，3:周，4:月
      remindType:[],//提醒方式
      runStatusArr:'',
      runStatus:"",//运行状态
      desc:'',//备注
    }
  }
  const superviseTypeData = [{name:"实时",id:1},{name:"天",id:2},{name:"周",id:3},{name:"月",id:4}];
  export default {
    data() {
      const vm = this
      return {
        title:this.$store.state.title,
        remindTypes:'',
        serverData: { //查询参数
          appIds:[],
          appId:null,//应用id
          superviseType:0,//监管方式
          runStatusArr:'',
          runStatus:null,//运行状态
        },
        modelTitle:'新建',
        appArr:[],//应用列表,
        myAppData:this.$store.state.myAppOrgAllData,//应用列表
        superviseTypeData:superviseTypeData,
        modelType:'0',//0新增，1修改，2详情
        personArr:[],//人员列表
        createForm:{
          appId:'',//应用名称
          level: 1,//预警级别
          dbSpaceLimit:'',//数据库空间阀值
          dbSpaceUrl:'',//数据库空间地址
          logSpaceLimit:'',//日志空间阀值
          logSpaceUrl:'',//日志空间地址
          fileSpaceLimit:'',//文件空间阀值
          fileSpaceUrl:'',//文件空间地址
          dutyUser:'',//责任人
          confirmUser:[],//确认人
          copyUser:'',//抄送人
          superviseType:0,//监管方式1:实时，2:天，3:周，4:月
          remindType:[],//提醒方式
          runStatusArr:'',
          runStatus:"",//运行状态
          desc:'',//备注
        },
        createModal:false,
        createRule: {
          dbSpaceUrl: [{
            required: false,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (value.length>200) {
                cb(new Error('数据库空间地址长度不能大于200！'))
                return
              }
              cb()
            }
          }],
          fileSpaceUrl: [{
            required: false,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (value.length>200) {
                cb(new Error('文件空间地址长度不能大于200！'))
                return
              }
              cb()
            }
          }],
          logSpaceUrl: [{
            required: false,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (value.length>200) {
                cb(new Error('日志空间地址长度不能大于200！'))
                return
              }
              cb()
            }
          }],
          appId: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!this.createForm.appId) {
                cb(new Error('请选择应用名称！'))
                return
              }
              cb()
            }
          }],
          dbSpaceLimit:[{
            trigger: 'blur',
            validator: function(rule, value, cb) {
                vm.vdNum(rule, value, cb);
              }
            }],
          logSpaceLimit:[{
            message: '请输入正确的数值',
            trigger: 'blur',
            validator: function(rule, value, cb) {
                vm.vdNum(rule, value, cb);
              }
            }],
          fileSpaceLimit:[{
            message: '请输入正确的数值',
            trigger: 'blur',
            validator: function(rule, value, cb) {
                vm.vdNum(rule, value, cb);
              }
            }],
          dutyUser: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!this.createForm.dutyUser) {
                cb(new Error('责任人不能为空'))
                return
              }
              cb()
            }
          }],
          confirmUser: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (this.createForm.confirmUser.length==0) {
                cb(new Error('确认人不能为空'))
                return
              }
              cb()
            }
          }],
          superviseType:  [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!this.createForm.superviseType) {
                cb(new Error('监管方式不能为空'))
                return
              }
              cb()
            }
          }],
          // remindType: [{required: true, message: '提醒方式不能为空', trigger: 'change'}],
          remindType: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (this.createForm.remindType.length==0) {
                cb(new Error('请选择提醒方式！'))
                return
              }
              cb()
            }
          }],
          runStatusArr: [{
            required: true,
            trigger: 'change',
            validator: (rule, value, cb) => {
              if (!this.createForm.runStatusArr) {
                cb(new Error('请选择运行状态！'))
                return
              }
              cb()
            }
          }],
          desc: [{required: false, trigger: 'blur',validator: (rule, value, cb) => {
              if (value.length>500) {
                cb(new Error('请输入0-500字符的备注！'))
                return
              }
              cb()
            }}],
        },
        columns: [
          {
            type: 'index',
            title: '序号',
            width: 60,
            align: 'center'
          },
          {
            title: '应用名称',
            key: 'appName'
          },
          {
            title: '预警级别',
            key: 'level',
            render: (h, params) => {
              let level = ['一般', '较重', '严重', '特别严重']
              if (params.row.level) {
                let num = params.row.level -1
                return h('span', level[num])
              } else {
                return h('span', '-')
              }
            }
          },
          {
            title: '数据库空间阈值(G)',
            key: 'dbSpaceLimit',
            width: 160
          },
          {
            title: '日志空间阀值(G)',
            key: 'logSpaceLimit',
            width: 160
          },
          {
            title: '文件空间阀值(G)',
            key: 'fileSpaceLimit',
            width: 160
          },
          {
            title: '责任人',
            key: 'dutyUserName'
          },
          {
            title: '确认人',
            key: 'confirmUserName',
            render: (h, params) => {
              return h('div', {
                style: {
                  maxHeight: '15px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                },
                attrs: {
                  title: params.row.confirmUserName
                }
              }, params.row.confirmUserName)
            }
          },
          {
            title: '监管方式',
            key: 'superviseType',
            render: (h, params) => {
              return h('span', superviseTypeData[params.row.superviseType-1].name)
            }
          },
          {
            title: '运行状态',
            key: 'runStatus',
            render: (h, params) => {
              return h('span', (params.row.runStatus) ? "开启" : "禁用")
            }
          },
          {
            title: '操作',
            key: 'act',
            width: 360,
            render: (h, params) => {
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
                    this.modelTitle = '修改';
                    console.log(params);
                    this.gotoCtrl(1, params.index)
                  }
                }
              },"修改");
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
                    this.modelTitle = '详情';
                    console.log(params);
                    this.gotoCtrl(2, params.index)
                  }
                }
              },"详情");
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
              const downLoad = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                // style: {
                //  display:this.checkButton('hardware_gxyy_server_manage_delete')?'inline-block':'none'
                // },
                on: {
                  click: () => {
                    let id = params.row.id;
                    let roots = process.env.API_ROOT;
                    let urlDownload = roots+"/api/supervise/storagesupervise/downloadScript?id=" + id + "&token=" + this.$store.state.userInfo.token;
                    window.open(urlDownload);
                  }
                }
              }, '下载脚本');
              const history = h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    vm.$router.push({
                      name: 'databaseHistory',
                      params: {
                        id: params.row.id
                      }
                    })
                  }
                }
              }, '采集记录');
              return h('div', [edit, detail, del, downLoad, history]);
            }
          }
        ],
        data: [],
        pageOption: { //分页参数
          pageNo: 1,
          total: 0,
          pageSize: 10
        },
      }
    },
    mounted() {
      this.fwlbByAdmin()
    },
    methods: {
      vdNum (rule, value, cb) {
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (value) {
          if(!reg.test(value) || value< 1 || value > 10000000) {
            rule.message = '请输入1-10000000的正整数';
            cb(new Error(rule.message));
          } else{
            cb();
          }
        } else{
          cb();
        }
        //  else if (!this.createForm.dbSpaceLimit && !this.createForm.logSpaceLimit && !this.createForm.fileSpaceLimit) {
        //   rule.message = '数据库空间阈值、日志空间阈值、文件空间阈值不能同时为空！';
        //   cb(new Error(rule.message));
        // }
      },
      onChange (e) {
        // this.$nextTick(() => {
        //   var num = this.createForm.dbSpaceLimit.replace(/[^\d]/g, '');
        //   if(num !== null && num !== ''){
        //     num =  parseInt(num);
        //   }
        //   this.createForm.dbSpaceLimit = num
        // })
      },
      fwlbByAdmin() {//查询我所管理的所有启用的应用或服务(1：应用；2：服务)
        api(comApiList.findAppIdListByPt).then((res) => {
          if (res.status == 200 && res.data.data) {
          this.appArr = res.data.data
          this.init(); //初始化
          this.appArr.forEach(item=>{
            this.serverData.appIds.push(item.appId)
        })
          // this.serverData.appId = this.appIds
          this.pageStoragesupervise(); //查询服务分配管理分页
        }
      }, (err) => {
          //dong something...
        })
      },
      onChangeLogSpaceLimit (e) {
        // this.$nextTick(() => {
        //   var num = this.createForm.logSpaceLimit
        //   .replace(/[^\d]/g, '');
        //   if(num !== null && num !== ''){
        //     num =  parseInt(num);
        //   }
        //   this.createForm.logSpaceLimit = num
        // })
      },
      onChangeFileSpaceLimit (e) {
        // this.$nextTick(() => {
        //   var num = this.createForm.fileSpaceLimit
        //   .replace(/[^\d]/g, '');
        //   if(num !== null && num !== ''){
        //     num =  parseInt(num);
        //   }
        //   this.createForm.fileSpaceLimit = num
        // })
      },
      init(){
        this.findOrgByPower();
        this.pageStoragesupervise(); //查询服务分配管理分页
      },
      pageChange(num) { //页码改变的回调
        if (!num) return;
        this.pageOption.pageNo = num;
        this.pageStoragesupervise();
      },
      changePageSize(num) { //切换每页条数时的回调
        if (!num) return;
        this.pageOption.pageSize = num;
        this.pageStoragesupervise();
      },
      pageStoragesupervise() { // 查询分页
        if (this.serverData.runStatusArr) {
          this.serverData.runStatus = (this.serverData.runStatusArr=="0") ? false : true;
        } else {
          this.serverData.runStatus = null
        }
        let ids = [];
        this.appArr.forEach(item=>{
          ids.push(item.appId);
        })
        this.serverData.appIds = ids;
        this.data = [];
        var formData = {
          "data": { ...this.serverData},
          "pageNo": this.pageOption.pageNo,
          "pageSize": this.pageOption.pageSize
        };
        api(superviseApiList.pageStoragesupervise, formData).then((res) => {
          if(res.status == 200 && res.data.data) {
            this.data = res.data.data.list;
            this.pageOption.pageSize = res.data.data.pageSize;
            this.pageOption.total = res.data.data.total;
            this.pageOption.pageNo = res.data.data.pageNum;
          }
        }, (err) => {
          //dong something...
        })
      },
      findOrgByPower() {
        api(superviseApiList.findOrgByPower).then((res) => {
          if (res.status == 200 && res.data.data) {
            let ids = [];
            res.data.data.forEach(item=>{
              ids.push(String(item.id));
            })
            this.findEmpByOrgId(ids);
          }
        }, (err) => {
          //dong something...
        })
      },
      findEmpByOrgId(ids){
        api(superviseApiList.findEmpByOrgId, {orgIds: ids}).then((resp) => {
          if (resp.status == 200 && resp.data.data) {
            let data = [];
            resp.data.data.forEach(item => {
              data.push({ name: item.name, gxqptEmpId: item.gxqptEmpId });
            })
            this.personArr = data;
            // commit("GETORGBYPOWER", data);
          }
        }, (err) => {
          //dong something...
        })
      },
      search() {
        this.pageOption.pageNo=1;
        this.pageStoragesupervise();
      },
      addNew(){
        this.modelTitle = '新建';
        this.modelType = '0';
        this.createModal = true;
        this.$refs.createForm.resetFields();
        this.$refs.dutyUser.clearSingleSelect();
      },
      saveHostRoom(){
        let url = '';
        (this.modelType=='0') ? url = superviseApiList.saveStoragesupervise : url = superviseApiList.updateStoragesupervise;
        this.$refs['createForm'].validate((valid) => {
          if(valid) {
            if (!this.createForm.dbSpaceLimit && !this.createForm.logSpaceLimit && !this.createForm.fileSpaceLimit) {
              this.$Message.error('数据库空间阈值、日志空间阈值、文件空间阈值不能同时为空！');
            } else {
              this.createForm.remindType = this.remindTypes
              this.createForm.confirmUser = this.createForm.confirmUser.join(",");
              if(this.createForm.copyUser.length!=0)this.createForm.copyUser = this.createForm.copyUser.join(",");
              this.createForm.runStatus = (this.createForm.runStatusArr=="0") ? false : true;
              api(url, this.createForm).then((res) => {
                if(res.status == 200 && res.data.data) {
                  if(res.data.data && res.data.errmsg == 'ok'){
                    let msg = (this.modelType=='0') ? '保存成功！' : '编辑成功！';
                    this.$Message.success(msg);
                    this.pageStoragesupervise();
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
          } else {
            this.$Message.error('表单验证失败！');
          }
        })
      },
      itemDelete(id,idx) {//删除
        const vm = this
        vm.$Modal.confirm({
          title: '删除确认',
          content: '确认删除吗？',
          onOk: () => {
            api(superviseApiList.deleteStoragesupervise, {id: id}).then(res => {
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
      selectChange (val) {
        console.log(val)
        if (val.length == 1) {
          this.remindTypes = val.join(",")
        } else if (val.length == 2) {
          this.remindTypes = '3'
        }
      },
      // 操作
      gotoCtrl (type, idx) {
        // this.$refs.dutyUser.clearSingleSelect();
        this.idx = idx;
        if(type==0){// 删除
          this.tableList.data.splice(idx, 1)
        }else{// 修改和详情
          this.$refs.createForm.resetFields();
          const data = JSON.parse(JSON.stringify(this.data[idx]))
          const createForm = {...getCreateForm(), ...data};
          if(!createForm.dbSpaceLimit && createForm.dbSpaceLimit !== 0) createForm.dbSpaceLimit = ''
          if(!createForm.logSpaceLimit && createForm.logSpaceLimit !== 0) createForm.logSpaceLimit = ''
          if(!createForm.fileSpaceLimit && createForm.fileSpaceLimit !== 0) createForm.fileSpaceLimit = ''
          if (createForm.remindType == '3') {
            createForm.remindType = ["1", "2"]
          } else {
            createForm.remindType = createForm.remindType.toString();
          }
          createForm.confirmUser = createForm.confirmUser.split(",");
          if(createForm.copyUser==null)createForm.copyUser="";
          if(createForm.copyUser) {
            createForm.copyUser = createForm.copyUser.split(",");
          }
          createForm.runStatusArr = (createForm.runStatus) ?　'1' : '0';
          this.createModal = true;
          this.modelType = (type==1) ? '1' : '2';
          this.createForm = createForm;
        }
      },
      checkButton(code){//按钮权限
        if(this.authButton.indexOf(code) >= 0){
          return true;
        }else{
          return false;
        }
      }
    },
    computed: {
      // 责任人列表
        dutyUsers () {
          return this.personArr.filter(item => {
            return !(this.createForm.confirmUser.includes(item.gxqptEmpId) || this.createForm.copyUser.includes(item.gxqptEmpId))
          })
        },
        // 确认人列表
        confirmUsers () {
          return this.personArr.filter(item => {
            return !((this.createForm.dutyUser ? this.createForm.dutyUser.includes(item.gxqptEmpId) : false) || this.createForm.copyUser.includes(item.gxqptEmpId))
          })
        },
        // 抄送人列表
        copyUsers () {
          return this.personArr.filter(item => {
            return !((this.createForm.dutyUser ? this.createForm.dutyUser.includes(item.gxqptEmpId) : false) || this.createForm.confirmUser.includes(item.gxqptEmpId))
          })
        },
      ...mapState([
        'authButton'
      ]),
      disa(){
        return(this.modelType=="2") ?  true : false;
      }
    },
    components:{
      hyUpload
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
    width: 200px;
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
  /deep/ .ivu-form-item{
    // margin-bottom: 14px;
  }
</style>
