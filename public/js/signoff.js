var Page = {
    init: function init() {
       this.table = this.initTable();
        this.handleEvents();

      
    },
    initTable: function initTable() {
        var self = this;
        return $('.js-exportable').DataTable({
            dom: 'rtip',
            processing: true,
            serverSide: true, //啟動服務器分頁
            searching: false,
            pageLength: 15,
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: "full_numbers",
            bSort: true,
            aaSorting: [
                [4, "desc"]
            ],
            ajax: function(data, callback, settings) {
                var data_url = window._JS_BASEURL+'SignOff_ajax/get_application_list';
                var searchData = getFormJson('form_z_a', 'typename', 'typevalue');
                //FORM表單值
                function getFormJson(idF, idS, idI) {
                    var select_page = $('#lid :selected').data("kind");
                    var searchData = {};
                    searchData.column = data.order[0].column;
                    searchData.dir = data.order[0].dir;
                    searchData.pageSize = data.length; //每頁的總數量   
                    searchData.pageIndex = data.start; //頁碼
                    var loginForm = $('#form-query').serializeArray();
                    // console.log(loginForm);
                   
                    
                    loginForm.push({
                        name:'date_status',
                         value: Basic.getUrlVars()['date_status']
                    })
                   
                    $.each(loginForm, function(i, v) {
                        searchData[v.name] = v.value;
                    });
                    var typename = $('#' + idS).val();
                    var typevalue = $('#' + idI).val();
                    searchData[typename] = typevalue;
                    return searchData;
                }
                //ajax请求数据
                $.ajax({
                    type: "POST",
                    url: data_url,
                    cache: false, //禁用缓存
                    data: {
                        send_data_: Basic._webBaseEncode(jQuery.param(searchData))
                    },
                    success: function(getstatus, status, xhr) {
                        var returnData = {};
                        // console.log(getstatus);
                        if(getstatus.status=='SUCCESS'){

                            returnData.draw = data.draw;
                            returnData.recordsTotal = getstatus.result.recordsTotal;
                            returnData.recordsFiltered = getstatus.result.recordsTotal;
                            returnData.data = getstatus.result.data; //返回的数据列表
                            $('#download').show();
                            $('#cancel').show();
                            
                        }else{
                            returnData.draw = data.draw;
                            returnData.recordsTotal = 0;
                            returnData.recordsFiltered =0;
                            returnData.data = []; //返回的数据列表
                            $('#download').hide();
                            $('#cancel').hide();
                        }
                      
                        callback(returnData);
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                    }
                });
            },
            columns: [

             {title: '選擇', className: 'text-center','orderable':false, render: function (data, type, row, meta) {
                        return '<div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input" name="checklist" value="' + row.ap_sys_id + '" id="' + row.ap_sys_id + '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' + row.ap_sys_id + '"></label></div>';

                    }
                         
            },{
                title: '單號',
                data: 'ap_create_order_no'
            }, {
                title: '主題',
                data: 'ap_title',
                orderable: false
            }, {
                title: '簽核進度',
                data: "ap_process",
                orderable: false
            }, {title: '技術資訊處', orderable: false,render: function (data, type, row, meta) {
                    
                            if(row.ap_group_id==='1'){
                                return "<span>藍新科技(股)公司</span>";
                            }
                            if(row.ap_group_id==='2'){
                                return "<span>簡單行動支付(股)公司</span>";
                            }
                            if(row.ap_group_id==='3'){
                                return "<span>群新網路(股)公司</span>";
                            }
                             if(row.ap_group_id==='4'){
                                return "<span>威肯金融科技(股)公司</span>";
                            }
                             if(row.ap_group_id==='5'){
                                return "<span>藍新金流(股)公司</span>";
                            }
                     }
            }, {
                title: '建立日期',
                data: 'ap_create_time'
            }, {
                title: '詳細資料',orderable: false,
                render: function(data, type, row, meta) {
                    return '<a class="btn btn-sm btn-secondary" href="SignOff/edit?PostData=' + row.ap_sys_id + '"><i class="fa fa-list-alt"></i> 詳細資料</a>';
                }
            }],

            fnDrawCallback: function() {

                $("[name='checklist']").each(function () {
                    var v = $(this).val();
                    if ($.inArray(v, id)> -1) {
                        this.checked = true;
                    }
                })             
            },    

            language: {
                "sProcessing": "<i class='fa fa-spinner fa-spin'></i> 讀取資料中...",
                "sLengthMenu": '',
                "sZeroRecords": '<span class="text-info">找不到符合的資料</span>',
                "sInfo": "<i class='far fa-list-alt text-info'></i> <span class='text-info'>顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆</span>",
                "sInfoEmpty": "<span class='text-info'>顯示第 0 至 0 項結果，共 0 項</span>",
                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                "sInfoPostFix": "",
                "sEmptyTable": "<span class='text-info'>找不到符合的資料</span>",
                "sLoadingRecords": "載入中...",
                "oPaginate": {
                    "sFirst": "首頁",
                    "sPrevious": "上頁",
                    "sNext": "下頁",
                    "sLast": "末頁"
                }
            },
        });
    },
    handleEvents: function handleEvents() {
        var self = this;
        flatpickr('.flatdatepickr', {
            locale: 'zh',
            maxDate: "today",
             onChange: function(selected, dt, inst) {
                var startDate = $("#date_start").val();
                var endDate = $("#date_end").val();
                //截止日大於起始日
                if(startDate !== '' && (inst.element.id === 'date_end' && dt < startDate)) {
                    $("#date_end").val(startDate);
                    $("#date_start").val(dt);

                }
                //起始日小截止日
                if(endDate !== '' && (inst.element.id === 'date_start' && dt > endDate)) {
                    $("#date_end").val(dt);
                    $("#date_start").val(endDate);
                }
            }
        });
        // 重設查詢
        $('#btnResetForm').on('click', function() {
            self.postParams = {};
            self.table.ajax.reload();
        });
        // 送出查詢
        $('#ajaxSubmitQuery').on('click', function(e) {
            e.preventDefault();
            self.postParams = Basic.getFormJsonData($('#form-query'));
            self.table.ajax.reload();
        });
        $("#ins").on('click', function() {
            var loginForm = $('#form-main').serializeArray();
            // console.log(loginForm);
             
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'SignOff_ajax/create_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('新增成功');
                        location.href = window._JS_BASEURL+'SignOff/edit?PostData='+callback.result;   
     
                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
        $("#upt").on('click', function() {
           
            var loginForm = $('#form-main').serializeArray();
            // console.log(loginForm);
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'SignOff_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL+'SignOff/edit?PostData='+Basic.getUrlVars()['PostData'];
                    } else {
                        alert('更新失敗');
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
        $("#applicant_verify").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('applicant_verify');
            }else{
                Basic.add_person('applicant_verify');

            }
        });
        $("#applicant_leader").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('applicant_leader');
            }else{
                Basic.add_person('applicant_leader');

            }
        });

        $("#applicant_leader_create").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct_ins('applicant_leader');
            }else{
                Basic.add_person('applicant_leader');

            }
        });

         $("#applicant_director").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('applicant_director');
            }else{
                Basic.add_person('applicant_director');

            }
        });


        $("#applicant_director_create").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct_ins('applicant_director');
            }else{
                Basic.add_person('applicant_director');

            }
        });
        $("#applicant").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('applicant');
            }else{
                Basic.add_person('applicant');

            }
        });


        $("#applicant_create").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct_ins('applicant');
            }else{
                Basic.add_person('applicant');

            }
        });

        $("#countersign_a_director").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_a_director');
            }else{
                Basic.add_person('countersign_a_director');

            }
        });
        $("#countersign_a_director_create").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct_ins('countersign_a_director');
            }else{
                Basic.add_person('countersign_a_director');

            }
        });
        $("#countersign_a_leader").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_a_leader');
            }else{
                Basic.add_person('countersign_a_leader');

            }
        });
        $("#countersign_a_leader_create").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct_ins('countersign_a_leader');
            }else{
                Basic.add_person('countersign_a_leader');

            }
        });

        $("#countersign_a_review").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_a_review');
            }else{
                Basic.add_person('countersign_a_review');

            }
        });

        $("#countersign_b_director").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_b_director');
            }else{
                Basic.add_person('countersign_b_director');

            }
        });
        $("#countersign_b_leader").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_b_leader');
            }else{
                Basic.add_person('countersign_b_leader');

            }
        });
        $("#countersign_c_director").on('click', function() {
           
            if(check_verification=='1'){
                Tool.direct('countersign_c_director');
            }else{
                Basic.add_person('countersign_c_director');

            }
        });
        $("#countersign_c_leader").on('click', function() {
            
            if(check_verification=='1'){
                Tool.direct('countersign_c_leader');
            }else{
                Basic.add_person('countersign_c_leader');

            }
        });
        $("#countersign_c_applicant").on('click', function() {
            if(check_verification=='1'){
                Tool.direct('countersign_c_applicant');
            }else{
                Basic.add_person('countersign_c_applicant');

            }
        });

        //列印
         $("#download").on('click', function() {
            if(id.length==0){
                       
                alert('未勾選項目');
                return false;
            }
            window.open(window._JS_BASEURL+'PrintContent/SignOff?PostData='+Basic._webBaseEncode('SysData='+id.join(",")),"_blank");
        });

         $("#print").on('click', function() {
            window.open(window._JS_BASEURL+'PrintContent/SignOff?PostData='+Basic._webBaseEncode('SysData='+print_id),"_blank");
        });

         //單號取消
         $("#cancel").on('click', function() {


               if(id.length==0){
                       
                    alert('未勾選項目');
                    return false;
                }else{
                    var sysid = 'SysData=' + id.join(",");
                }

             $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'SignOff_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid)
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功');
                        location.href = window._JS_BASEURL+'SignOff';
                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });   

            
         });



        $("input:checkbox").on('click', function() {
        var $box = $(this);
        if ($box.is(":checked")) {

            var group = "input:checkbox[name='" + $box.attr("name") + "']";

            $(group).prop("checked", false);
            $box.prop("checked", true);
        } else {
            $box.prop("checked", false);
        }
    });
    }
};
var Tool = {
    
    //新增表單&簽核驗證
    ins: function ins() {
        var pw = $("#pw").val() || null;
        if (pw === null) {
            alert('請輸入密碼')
            return false;
        }
        var loginForm = $('#form-main').serializeArray();

        loginForm.push({
            name: 'pw',
            value: pw
        })

        loginForm.push({
            name: 'signoff',
            value: TableName
        })

        // console.log( loginForm);

       $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'SignOff_ajax/create_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                       
                        alert('新增成功');
                        location.href = window._JS_BASEURL+'SignOff/edit?PostData='+callback.result;   
                                 
                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });

     },
     //快速新增表單
    direct_ins: function direct_ins(Name) {
        var loginForm = $('#form-main').serializeArray();
        loginForm.push({
            name: 'signoff',
            value: Name
        })
        // console.log(loginForm);
         $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'SignOff_ajax/create_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('新增成功');    
                        location.href = window._JS_BASEURL+'SignOff/edit?PostData='+callback.result;   


                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });

    },

    save: function save() {
        var isclick = true;
        var pw = $("#pw").val() || null;
        var SysId = $("#sys_id").val() || null;
        if (pw === null) {
            alert('請輸入密碼')
            return false;
        }
        var loginForm = $('#form').serializeArray();
        loginForm.push({
            name: 'signoff',
            value: TableName
        })
        // console.log(loginForm);
        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'SignOff_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function(callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {
                    alert('更新成功');
                    location.href = window._JS_BASEURL+'SignOff';
                } else {
                    alert(callback.message);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
    },
     direct:function direct(Name){
       
         var loginForm =[];
             loginForm[0]={name: 'signoff',value: Name};
             loginForm[1]={name: 'sys_id',value: sys_id};
             loginForm[2]={name: 'group_id',value: group_id};
             loginForm[3]={name: 'process',value: process};
        // console.log(loginForm);

        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'SignOff_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function(callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {
                    alert('更新成功');
                    location.href = window._JS_BASEURL+'SignOff';
                } else {
                    alert(callback.message);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
    },
};
jQuery(document).ready(function() {
    Page.init();
    var TableName = "";

    
});