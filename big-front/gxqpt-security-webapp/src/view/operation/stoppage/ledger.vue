<template>
		<Layout>
			<Content>
				<Breadcrumb>
					<BreadcrumbItem>故障管理</BreadcrumbItem>
					<BreadcrumbItem>故障台账</BreadcrumbItem>
				</Breadcrumb>
				<Card>
					<Form ref="formValidate" v-model="searchData" inline :label-width="90">
						<FormItem label="故障名称">
							<Input class="queryItem" type="text" v-model="searchData.faultName"> </Input>
						</FormItem>
						<FormItem label="故障级别">
							<Select class="queryItem" v-model="searchData.faultLevel">
								<Option value="">全部</Option>
								<Option value="1">一级</Option>
								<Option value="2">二级</Option>
								<Option value="3">三级</Option>
							</Select>
						</FormItem>
						<FormItem label="产生时间">
							<DatePicker class="queryItem" :editable="false" @on-change="changeTime" format="yyyy/MM/dd" type="daterange" placement="bottom-end" placeholder="请选择日期"></DatePicker>
						</FormItem>
						<FormItem label="故障状态">
							<Select class="queryItem" v-model="searchData.status">
								<Option value="0">全部</Option>
								<Option value="1">未处理</Option>
								<Option value="2">处理中</Option>
								<Option value="3">已完结</Option>
							</Select>
						</FormItem>
						<FormItem label="是否属实">
							<Select class="queryItem" v-model="searchData.isTrue">
								<Option value="">全部</Option>
								<Option value="1">是</Option>
								<Option value="2">否</Option>
							</Select>
						</FormItem>
						<FormItem label="故障主机">
							<Input class="queryItem" type="text" v-model="searchData.faultHost"> </Input>
						</FormItem>
						<FormItem label="系统名称">
							<Select class="queryItem" v-model="searchData.systemId">
								<Option value="">全部</Option>
								<Option v-for="item in systemList" :value="item.appId" :key="item.appId">{{item.name}}</Option>
							</Select>
						</FormItem>
						<FormItem :label-width="20">
							<Button type="primary" @click="preSearch" v-if="authButton.includes('ops_fault_ledger_query')">查询</Button>
						</FormItem>
					</Form>
					<hy-table
	                    highlight-row
	                    border
	                    :current="pageInfo.pageNo"
	                    :columns="columns"
	                    :data="data"
	                    :total="Number(pageInfo.total)"
	                    :pageSize="Number(pageInfo.pageSize)"
	                    pageType="small"
	                    show-elevator
	                    show-sizer
	                    ref="selection"
	                    @on-page-change="pageChange" />
				</Card>
			</Content>
			<Modal v-model="dealModal" title="处理报告" width="60%" :mask-closable="false">
				<ledger-dealview :dataView="dataView"></ledger-dealview>
				<div slot="footer">
					<Button type="text" @click="closeDealModal">关闭</Button>
				</div>
			</Modal>
		</Layout>
</template>

<script>
import {mapState} from 'vuex'
import ledgerView from './view'
import ledgerDealview from './dealView'
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'
export default {
	data() {
		const vm = this
		return {
			dealModal: false,
			systemList: [], //系统名称列表
			searchData: { //查询参数对象
				"endTime": "",
				"faultHost": "",
				"faultInfo": "",
				"faultLevel": "",
				"faultName": "",
				"isTrue": "",
				"startTime": "",
				"status": "",
				"systemId": ""
			},
			columns: [{
					type: 'index',
					title: '序号',
					width: 60,
					align: 'center'
				},
				{
					title: '故障名称',
					key: 'faultName'
				},
				{
					title: '故障类别',
					key: 'faultType'
				},
				{
					title: '故障级别',
					key: 'faultLevel',
					render: (h, params) => {
						return h('div', ['--', '一级', '二级', '三级', '四级'][params.row.faultLevel || 0])
					}
				},
				{
					title: '系统名称',
					key: 'systemName'
				},
				{
					title: '故障主机',
					key: 'faultHost'
				},
				{
					title: '故障状态',
					key: 'status',
					render: (h, params) => {
						var statusText;
						switch(params.row.status) {
							case 1:
								statusText = "未处理";
								break;
							case 2:
								statusText = "处理中";
								break;
							case 3:
								statusText = "已完结";
								break;
							default:
								statusText = "--";
								break;
						};
						return h('span', statusText);
					}
				},
				{
					title: '产生时间',
					key: 'happenTime',
					width: 160
				},
				{
					title: '是否属实',
					key: 'isTrue',
					render: (h, params) => {
						var isTrueText;
						switch(params.row.isTrue) {
							case '1':
								isTrueText = "属实";
								break;
							case '2':
								isTrueText = "不属实";
								break;
							default:
								isTrueText = "";
								break;
						};
						return h('span', isTrueText);
					}
				},
				{
					title: '操作',
					key: 'act',
					align: 'center',
					width: 160,
					render: (h, params) => {
						const detail = h('Button', {
							props: {
								type: 'primary',
								size: 'small'
							},
					        style: {
					          	marginRight: '8px'
					        },
							on: {
								click: () => {
									this.$router.push({
										name: 'stopDetail',
										params: {
											id: params.row.id
										}
									})
								}
							}
						}, '详情');
						const dealDetail = h('Button', {
							props: {
								type: 'primary',
								size: 'small'
							},
					        style: {
					          	marginRight: '8px'
					        },
							on: {
								click: () => {
									var ledgerId = params.row.id;
									this.dealViewGetById(ledgerId);
								}
							}
						}, '处理报告');
						const btns = []
						if(params.row.status == 3 && params.row.isTrue=="1") {
							if (vm.authButton.includes('ops_fault_ledger_handle')) {
								btns.push(dealDetail)
							}
						}
						if (vm.authButton.includes('ops_fault_ledger_detail')) {
							btns.push(detail)
						}
						return h('div', btns)
					}
				},
			],
			data: [],
			pageInfo: { //分页参数
				pageNo: 1,
				total: 0,
				pageSize: 10
			},
			dataView: {}, //详情数据
		}
	},
	computed: {
		...mapState(['authButton'])
	},
	components: {
		ledgerView,
		ledgerDealview
	},
	mounted() {
		this.getSystemList(); //获取系统列表
		this.faultPage(); //获取故障台账列表
	},
	methods: {
	    preSearch() {
	        this.pageInfo.pageNo = 1
	        this.faultPage()
	    },
        pageChange(pageNo, pageSize) {
            this.pageInfo.pageNo = pageNo
            this.pageInfo.pageSize = pageSize
            this.faultPage()
        },
		closeDealModal() { //关闭dealModal窗口
			this.dealModal = false;
		},
		getSystemList() { //获取系统列表
			const vm = this
			api(operationApiList.findAppByAdminWithEnable)
			.then(res => {
				if(res.data.errcode === 0) {
					vm.systemList = res.data.data
				}
			}, (error) => {
				console.log(error)
			})
		},
		changeTime(val) { //选择时间
			if(val[0] && val[1]) {
				var startTime = val[0].replace(/\//g, "-");
				var endTime = val[1].replace(/\//g, "-");
				this.searchData.startTime = startTime + " 00:00:00";
				this.searchData.endTime = endTime + " 23:59:59";
			} else {
				this.searchData.startTime = "";
				this.searchData.endTime = "";
			}
		},
		faultPage() { //获取故障台账列表
			const vm = this
			let searchString = (JSON.stringify(vm.searchData)).replace(/\ +/g, "")
			let searchJson = JSON.parse(searchString)
			searchJson.startTime = vm.searchData.startTime
			searchJson.endTime = vm.searchData.endTime
			var formData = {
				"data": searchJson,
				"pageNo": this.pageInfo.pageNo,
				"pageSize": this.pageInfo.pageSize
			};
			api(operationApiList.faultPage, formData).then(res => {
				if(res.data.errcode === 0) {
					vm.data = res.data.data.list;
					if(vm.data.length > 0) {
						vm.pageInfo.pageSize = res.data.data.pageSize;
						vm.pageInfo.total = res.data.data.total;
						vm.pageInfo.pageNo = res.data.data.pageNum;
					};
				}
			}, (error) => {
				console.log(error)
			})
		},
		dealViewGetById(ledgerId) { //根据Id查询详情信息
			this.dealModal = true;
			api(operationApiList.faultGetById, {
				"id": ledgerId
			}).then((res) => {
				if(res.status == 200 && res.data.data) {
					this.dataView = res.data.data;
				}
			}, (err) => {})
		}
	}
}
</script>

<style type="text/css" scoped>
	.wAuto {
		width: 100%;
	}

	.queryItem {
		width: 200px;
	}

	.flow {
		margin-top: 20px;
	}
</style>
