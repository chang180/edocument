var Page = {
    init: function init() {
        this.table = this.initTable()
        this.handleEvents()
        let table = this.table
        $('a.toggle-vis').on('click', function (e) {
            e.preventDefault();
     
            // Get the column API object
            var column = table.column($(this).attr('data-column'));
     
            // Toggle the visibility
            column.visible(!column.visible());

            // 切換按鈕顏色
            $(this).toggleClass('btn-info btn-secondary')
        });
    },
    initTable: function initTable() {
        var self = this
        var check_sign = 0
        return $('.js-exportable').DataTable({
            dom: 'rtip',
            processing: true,
            serverSide: true, //啟動服務器分頁
            searching: false,
            pageLength: 50, //每頁項目數
            "columnDefs": [
                { "width": "28%", "targets": 4 }, 
                { "width": "10%", "targets": 7 },
                { "orderable": false, "targets": [4,5,6,8] },
            ],
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: 'full_numbers',
            bSort: true,
            aaSorting: [[9, 'desc']],
            ajax: function (data, callback, settings) {
                var data_url = '/Deploy_ajax/get_debug_and_demand_list'
                var searchData = getFormJson('form_z_a', 'typename', 'typevalue')
                //FORM表單值
                function getFormJson(idF, idS, idI) {
                    var select_page = $('#lid :selected').data('kind')
                    var searchData = {}
                    searchData.column = data.order[0].column
                    searchData.dir = data.order[0].dir
                    searchData.pageSize = data.length //每頁的總數量
                    searchData.pageIndex = data.start //頁碼
                    searchData.is_deployed = 0 //待上版
                    //取得form表單資訊
                    var loginForm = $('#form-query').serializeArray()

                    loginForm.push({
                        name: 'PostData',
                        value: Basic.getUrlVars()['PostData'],
                    })

                    if (Basic.getUrlVars()['PostData'] != null) {
                        check_sign = 1
                    }

                    $.each(loginForm, function (i, v) {
                        searchData[v.name] = v.value
                    })
                    var typename = $('#' + idS).val()
                    var typevalue = $('#' + idI).val()
                    searchData[typename] = typevalue
                    // console.log(searchData)
                    return searchData
                }
                //ajax请求数据
                $.ajax({
                    type: 'POST',
                    url: data_url,
                    cache: false, //禁用缓存
                    data: {
                        send_data_: Tool._webBaseEncode(jQuery.param(searchData)),
                    },
                    success: function (getstatus, status, xhr) {
                        // console.log(getstatus)
                        var returnData = {}
                        if (getstatus.status == 'SUCCESS') {
                            // console.log(getstatus.result.data)
                            returnData.draw = data.draw
                            returnData.recordsTotal = getstatus.result.recordsTotal
                            returnData.recordsFiltered = getstatus.result.recordsTotal
                            returnData.data = getstatus.result.data //返回的数据列表
                            $('#download').show()
                            $('#deploy').show()
                        } else {
                            returnData.draw = data.draw
                            returnData.recordsTotal = 0
                            returnData.recordsFiltered = 0
                            returnData.data = [] //返回的数据列表
                            $('#download').hide()
                            $('#deploy').hide()
                        }

                        callback(returnData)
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert('網路可能不夠順暢，請稍後再嘗試。')
                    },
                })
            },
            columns: [
                {
                    title: '選擇',
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        // console.log(row)
                        return (
                            '<div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input"'+ 
                            'data-patch_type="'+((row.dem_order_no)?"demand":"debug")+'"'+
                            'name="checklist" value="' +
                            row.sys_id +
                            '" id="' +
                            row.sys_id +
                            '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' +
                            row.sys_id +
                            '"></label></div>'
                        )
                    },
                },
                {
                    title: '上版單號',
                    data: 'dp_order_no',
                },
                {
                    title: '需求單號',
                    data: 'dem_order_no',
                },
                {
                    title: '除錯單號',
                    data: 'de_order_no',
                },
                {
                    title: '主題',
                    data: 'title',
                },
                {
                    title: '主機範圍',
                    data: 'deploy_range',
                },
                {
                    title: '版號',
                    data: 'git',
                },
                {
                    title: '平台項目',
                    data: 'platform_name',
                },
                {
                    title: '負責人',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.mb_user_name + '(' + row.mb_staff_id + ')</span>'
                    },
                },
                {
                    title: '預計上版日期',
                    data: 'deploy_time',
                },
                {
                    title: '上版類型',
                    data: 'patch_type',
                },
            ],
            fnDrawCallback: function () {
                $("[name='checklist']").each(function () {
                    var v = $(this).val()
                    if ($.inArray(v, id) > -1) {
                        this.checked = true
                    }
                })
            },
            language: {
                sProcessing: "<i class='fa fa-spinner fa-spin'></i> 讀取資料中...",
                sLengthMenu: '',
                sZeroRecords: '<span class="text-info">找不到符合的資料</span>',
                sInfo:
                    "<i class='far fa-list-alt text-info'></i> <span class='text-info'>顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆</span>",
                sInfoEmpty:
                    "<span class='text-info'>顯示第 0 至 0 項結果，共 0 項</span>",
                sInfoFiltered: '(由 _MAX_ 项结果过滤)',
                sInfoPostFix: '',
                sEmptyTable: "<span class='text-info'>找不到符合的資料</span>",
                sLoadingRecords: '載入中...',
                oPaginate: {
                    sFirst: '首頁',
                    sPrevious: '上頁',
                    sNext: '下頁',
                    sLast: '末頁',
                },
            },
        })
    },
    handleEvents: function handleEvents() {
        var self = this
        flatpickr('.flatdatepickr', {
            locale: 'zh',
            maxDate: '',
            onChange: function (selected, dt, inst) {
                var startDate = $('#date_start').val()
                var endDate = $('#date_end').val()
                //截止日大於起始日
                if (
                    startDate !== '' &&
                    inst.element.id === 'date_end' &&
                    dt < startDate
                ) {
                    $('#date_end').val(startDate)
                    $('#date_start').val(dt)
                }
                //起始日小截止日
                if (
                    endDate !== '' &&
                    inst.element.id === 'date_start' &&
                    dt > endDate
                ) {
                    $('#date_end').val(dt)
                    $('#date_start').val(endDate)
                }
            },
        })

        // 重設查詢
        $('#btnResetForm').on('click', function () {
            self.postParams = {}
            self.table.ajax.reload()
        })
        // 送出查詢
        $('#ajaxSubmitQuery').on('click', function (e) {
            e.preventDefault()
            self.postParams = Tool.getFormJsonData($('#form-query'))
            self.table.ajax.reload()
        })
        // 上版公告查詢
        $('#date_uery').on('click', function (e) {
            $('#date_start, #date_end').val($('#deploy_date').val())
            e.preventDefault()
            self.postParams = Tool.getFormJsonData($('#form-query'))
            self.table.ajax.reload()
        })

        //更新
        $('#upt').on('click', function () {
            var loginForm = $('#form-main').serializeArray()
            // console.log(loginForm)
            $.ajax({
                type: 'POST',
                url: '/Deploy_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Deploy/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    } else {
                        alert('更新失敗')
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                },
            })
        })

        //資安人員填寫版控版號
        $('#ss_desc').on('click', function () {
            var loginForm = $('#form-main').serializeArray()
            // console.log(loginForm)
            $.ajax({
                type: 'POST',
                url: '/Deploy_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Deploy/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    } else {
                        alert('更新失敗')
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                },
            })
        })

        //單號上版
        $('#deploy').on('click', function () {
            // console.log(id,patch_type)
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            } else {
                var sysid = 'sys_data=' + id.join(',') + '&patch_type='+patch_type.join(',') + '&deploy=1'
            }

            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Deploy_ajax/alter_deploy_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid),
                },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('選擇項目已上版')
                        $('#ajaxSubmitQuery').click() //更新項目，但不重新更新畫面
                        // location.href = window._JS_BASEURL + 'Deploy/not_deployed'
                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                },
            })
        })
        $('#modal_form').keypress(function (e) {
            if (e.keyCode == 13) {
                if (Basic.getUrlVars()[0].split('/')[4] == 'create') {
                    Tool.ins()
                } else {
                    Tool.save()
                }
            }
        })
    },
}
var Tool = {
    _webBaseEncode: function _webBaseEncode(e) {
        var t,
            r = ''
        t = encodeURIComponent(e)
        for (var a = 0; a < t.length; a++) r += t.charCodeAt(a).toString(16)
        return r
    },
    getFormJsonData: function getFormJsonData($form) {
        var unindexed_array = $form.serializeArray()
        var indexed_array = {}
        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value']
        })
        return indexed_array
    },
    getInformation: function getInformation(id) {
    },
}
jQuery(document).ready(function () {
    Page.init()
    var TableName = ''
})

//設定checkbox選取或不選取時賦予之值(1,0)
$('input:checkbox').on('click', function () {
    var $box = $(this)
    if ($box.is(':checked')) {
        $box.val(1)
    } else {
        $box.val(0)
        // $box.removeAttr('checked');
    }
})

//各相關checkbox選取/不選取時會顯示欄位/隱藏並清除相關內容
$('#account').on('click', function () {
    if ($('#account').is(':checked')) {
        $('.account_name').prop('readonly', false)
    } else {
        $('.account_name').val('')
        $('.account_name').prop('readonly', true)
    }
})

$('#email_group').on('click', function () {
    if ($('#email_group').is(':checked')) {
        $('.email_group_name').prop('readonly', false)
    } else {
        $('.email_group_name').val('')
        $('.email_group_name').prop('readonly', true)
    }
})


//複選框點擊事件
var patch_type = []
var id = []
function GetIds() {
    patch_type = []
    id = []
    //獲取所有複選框
    $("input:checkbox[name='checklist']:checked").each(function () {
        patch_type.push($(this).data('patch_type'))
        id.push($(this).val())
    })
}




