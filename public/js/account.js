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
                [3, "desc"]
            ],
            ajax: function(data, callback, settings) {
                var data_url = window._JS_BASEURL+'Account_ajax/get_account_list';
                var searchData = getFormJson('form_z_a', 'typename', 'typevalue');
                            // console.log(searchData);

                //FORM表單值
                function getFormJson(idF, idS, idI) {
                    var select_page = $('#lid :selected').data("kind");
                    var searchData = {};
                    searchData.column = data.order[0].column;
                    searchData.dir = data.order[0].dir;
                    searchData.pageSize = data.length; //每頁的總數量   
                    //searchData.pageIndex = (data.start / data.length); //頁碼
                    searchData.pageIndex = data.start;
                    var loginForm = $('#form-query').serializeArray();
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
                        // console.log(getstatus);
                        var returnData = {};
                        returnData.draw = data.draw;
                        returnData.recordsTotal = getstatus.result.recordsTotal;
                        returnData.recordsFiltered = getstatus.result.recordsTotal;
                        returnData.data = getstatus.result.data; //返回的数据列表
                        callback(returnData);
                    }
                });
            },
            columns: [{
                title: '員工編號',
                data: 'mb_staff_id'
            }, {
                title: '登入帳號',
                data: 'mb_name'
            },  {
                title: '姓名',
                data: 'mb_user_name'
            },  {
                title: '英文名',
                data: 'mb_eng_name'
            },  {
                title: '所屬公司',
                render: function(data, type, row, meta) {
                    if (row.mb_group === '1') {
                        return '<span>簡單</span>';
                    }
                    if (row.mb_group === '2') {
                        return '<span>藍新</span>';
                    }
                    if (row.mb_group === '3') {
                        return '<span>威肯</span>';
                    }
                    if (row.mb_group === '4') {
                        return '<span>群心</span>';
                    }
                }
            },  {
                title: '單位',
                data: 'mb_dpt'
            },  {
                title: '職稱',
                data: 'mb_jobtitle'
            }, {
                title: '登入時間',
                data: "mb_update_date"
            }, {
                title: '啟用狀態',
                data: "mb_is_enabled"
            }, {
                title: '設定',
                render: function(data, type, row, meta) {
                    var html_setting = '<button type="button"  class="btn btn-warning ajax_detail"  data-name="'+row.mb_name+'" data-detail="' + row.PostData + '" >會員資訊</button> ';
                    if (row.mb_is_enabled === '啟用') {
                        html_setting += '<button type="button"  class="btn btn-danger ajax_enable"  data-sysid="' + row.mb_sys_id + '" >停用</button>';
                    }
                    return html_setting;
                }
            }],
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
        $("#add").on('click', function() {
            var loginForm = $('#form-add').serializeArray();
            // console.log(loginForm);
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'Account_ajax/ins',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('新增成功');
                        location.href = window._JS_BASEURL+'Account';
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
            var loginForm = $('#form-upt').serializeArray();
            // console.log(loginForm);
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'Account_ajax/upt_info',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL+'Account';
                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
        $(document).on('click', '.ajax_enable', function(e) {
            // console.log(auth);

            if((auth&4)||(auth&32)){

            var sysid = 'SysID=' + $(this).data('sysid');
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'Account_ajax/upt_enable',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid)
                },
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('已關閉此帳號');
                        location.href = window._JS_BASEURL+'Account';
                    } else {
                        alert(callback.message);
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });        
           
            }else{
                alert("沒權限");
                return false;
            }
            
        });
        $(document).on('click', '.ajax_detail', function(e) {
            var name = $(this).data('name');
                     
            if(((auth&4)||(auth&32)) ||(name==mb_name)){
                var PostData = $(this).data('detail');
                location.href = window._JS_BASEURL+'Account/edit?PostData=' + PostData;
            }else{
                alert("沒權限");
                return false;
            }
           
        });
        $('#store_import').click(function() {
             var  upload_date=$("#upload").val();
             var  group = $("#group option:selected").val();

            if(upload_date==''){
               alert('請選擇檔案');
               return false;

            } 

            if(group==''){
               alert('請選所屬公司');
               return false;

            } 
            var data = new FormData($('#form1')[0]);
            $.ajax({
                url: window._JS_BASEURL+'Account_ajax/upload',
                type: 'POST',
                data: data,
                dataType: 'JSON',
                cache: false,
                processData: false,
                contentType: false,
                success: function(callback, status, xhr) {
                    // console.log(callback);
                    if(callback.status=='SUCCESS'){
                        alert('檔案上傳成功');
                       location.href = window._JS_BASEURL+'Account/upload';
                    }else{
                        alert(callback.message);
   
                    }
                    // console.log(callback);
                    // console.log(status);
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
    }
};

jQuery(document).ready(function() {
    Page.init();
});