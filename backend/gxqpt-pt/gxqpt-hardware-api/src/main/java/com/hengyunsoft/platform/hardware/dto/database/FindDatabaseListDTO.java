package com.hengyunsoft.platform.hardware.dto.database;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

@Data
@ApiModel(value = "FindDatabaseListDTO", description = "查询数据库列表返回数据实体")
public class FindDatabaseListDTO {

    /**
     * 主键id
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "主键id")
    private Long id;


    /**
     * 数据库实例ID
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "数据库实例ID")
    private String instanceDi;



    /**
     * 数据库管理员
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "数据库管理员")
    private String admin;

    /**
     * 数据库账户
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "数据库账户")
    private String account;


    /**
     * 数据库类型：1、MYSQL；2、ORACLE；3、SQLSERVER；4、ACCESS、5、SYBASE
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "数据库类型：1、MYSQL；2、ORACLE；3、SQLSERVER；4、ACCESS、5、SYBASE")
    private Integer type;

    /**
     * 主机IP地址
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "主机IP地址")
    private String hostIpAddress;

    /**
     * 字符集
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "字符集")
    private String characterSet;

    /**
     * 端口
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "端口")
    private String port;

    /**
     * 所属网络
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "所属网络")
    private String code;
    /**
     * 关联业务系统
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "关联业务系统市")
    private String associatedServiceSystem;

    /**
     * 创建时间
     *
     * @mbggenerated
     */
    @ApiModelProperty(value = "创建时间")
    private Date createTime;
}
