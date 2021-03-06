const validateNumber = (rule, value, callback) => {//数字类型表单验证
	let reg = /^\d*$/;
	if(!reg.test(value)) {
		callback(new Error(rule.message));
	} else if(value<0 || value > 999999999){
		rule.message = "请输入0-999999999之间的整数";
		callback(new Error(rule.message));
	} else {
		callback();
	}
};
const validNumber = (rule, value, callback) => {//数字类型表单验证
	let reg = /^\d+(\.\d+)?$/;
	if(!reg.test(value)) {
		callback(new Error(rule.message));
	} else if(value<0 || value > 120){
		rule.message = "请输入0-120之间的整数";
		callback(new Error(rule.message));
	}else{
		callback();
	}
};
const validNumber100 = (rule, value, callback) => {//数字类型表单验证0-100
	let reg = /^\d+(\.\d+)?$/;
	if(!reg.test(value)) {
		callback(new Error(rule.message));
	} else if(Number(value)<0 || Number(value) > 100){
		rule.message = "请输入0-100之间的整数";
		callback(new Error(rule.message));
	}else{
		callback();
	}
};
const semicolonNumber = (rule, value, callback) => {//分号和数字表单验证
	let reg = /^[;0-9]*$/;
	if (!reg.test(value)) {
		callback(new Error(rule.message));
	} else {
		callback();
	}
};
const chineseNumAlphabet = (rule, value, callback) => { //中文和数字和字母表单验证
	let myreg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/
	if (!myreg.test(value)) {
		callback(new Error(rule.message));
	} else {
		callback();
	}
};

const numAlphabet = (rule, value, callback) => { //数字和字母表单验证
	let myreg =  /^[_A-Za-z0-9]+$/
	if (!myreg.test(value)) {
		callback(new Error(rule.message));
	} else {
		callback();
	}
};
const validatePhone = (rule, value, cb) => {
  if (!value) {
    cb()
  }
  if (!/^1[345789]\d{9}$/.test(value)) {
    cb(new Error('手机号格式不正确'))
  } else {
    cb()
  }
}
export { validateNumber, validNumber100, semicolonNumber, chineseNumAlphabet, numAlphabet ,validNumber, validatePhone}
