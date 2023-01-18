var Page = {
    init: function init() {
        this.table = this.initTable()
        this.handleEvents()
    },
    initTable: function initTable() {
        var self = this
        var check_sign = 0
        return $('.js-exportable').DataTable({
            dom: 'rtip',
            processing: true,
            serverSide: true, //啟動服務器分頁
            searching: false,
            pageLength: 15,
            "columnDefs": [
                { "width": "18%", "targets": 2 },
                { "orderable": false, "targets": [2, 4, 5, 7, 8, 10] },
            ],
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: 'full_numbers',
            bSort: true,
            aaSorting: [[9, 'desc']],
            ajax: function (data, callback, settings) {
                var data_url = '/Demand_ajax/get_demand_list'
                var searchData = getFormJson('form_z_a', 'typename', 'typevalue')
                //FORM表單值
                function getFormJson(idF, idS, idI) {
                    var select_page = $('#lid :selected').data('kind')
                    var searchData = {}
                    searchData.column = data.order[0].column
                    searchData.dir = data.order[0].dir
                    searchData.pageSize = data.length //每頁的總數量
                    searchData.pageIndex = data.start //頁碼
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
                            returnData.draw = data.draw
                            returnData.recordsTotal = getstatus.result.recordsTotal
                            returnData.recordsFiltered = getstatus.result.recordsTotal
                            returnData.data = getstatus.result.data //返回的数据列表
                            $('#download').show()
                            $('#cancel').show()
                        } else {
                            returnData.draw = data.draw
                            returnData.recordsTotal = 0
                            returnData.recordsFiltered = 0
                            returnData.data = [] //返回的数据列表
                            $('#download').hide()
                            $('#cancel').hide()
                        }

                        callback(returnData)
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert('網路可能不夠順暢，請稍候再嘗試。')
                    },
                })
            },
            columns: [
                {
                    title: '選擇',
                    className: 'text-center',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return (
                            '<div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input" name="checklist" value="' +
                            row.dem_sys_id +
                            '" id="' +
                            row.dem_sys_id +
                            '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' +
                            row.dem_sys_id +
                            '"></label></div>'
                        )
                    },
                },
                {
                    title: '需求單號',
                    data: 'dem_order_no',
                },
                {
                    title: '主題',
                    data: 'dem_title',
                },
                {
                    title: '上版項目單號',
                    data: 'dem_deploy_no',
                },
                {
                    title: '主機範圍',
                    data: 'dem_deploy_range',
                },
                {
                    title: 'redmine編號',
                    data: 'dem_redmine_no',
                },
                {
                    title: 'git版號',
                    data: 'dem_git',
                },
                {
                    title: '預計上版日期',
                    data: 'dem_deploy_time',
                },
                {
                    title: '開立群組',
                    render: function (data, type, row, meta) {
                        if (row.dem_group_id === '1') {
                            return '<span>簡單</span>'
                        }
                        if (row.dem_group_id === '2') {
                            return '<span>藍新</span>'
                        }
                        if (row.dem_group_id === '3') {
                            return '<span>威肯</span>'
                        }
                    },
                },
                {
                    title: '負責人員',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.mb_user_name + '(' + row.dem_dev_rd + ')</span>'
                    },
                },
                {
                    title: '建立日期',
                    data: 'dem_create_time',
                },
                {
                    title: '詳細資料',
                    render: function (data, type, row, meta) {
                        return (
                            '<a class="btn btn-sm btn-secondary" href="' +
                            window._JS_BASEURL +
                            'Demand/edit?PostData=' +
                            row.dem_sys_id +
                            '&check_sign=' +
                            check_sign +
                            '"><i class="fa fa-list-alt"></i> 詳細資料</a>'
                        )
                    },
                },
                {
                    title: '上版狀態',
                    render: function (data, type, row, meta) {
                        if (row.dem_is_deployed === '0') {
                            return '<span>待上版</span>'
                        }
                        if (row.dem_is_deployed === '1') {
                            return '<span>已上版</span>'
                        }
                    }
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
            // defaultDate: 'today',
            // maxDate: 'today',
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
            //防連點
            let that = $(this);
            $(that).attr('disabled', true);
            setTimeout(function () {
                $(that).attr('disabled', false);
            }, 3000);
            e.preventDefault()
            self.postParams = Tool.getFormJsonData($('#form-query'))
            self.table.ajax.reload()
        })
        // 下載查詢結果
        $('#download').on('click', function (e) {
            //防連點
            let that = $(this);
            $(that).attr('disabled', true);
            setTimeout(function () {
                $(that).attr('disabled', false);
            }, 3000);
            e.preventDefault()
            url = 'Demand_ajax/download'
            searchData = Tool.getFormJsonData($('#form-query'))
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(searchData)),
                },
                dataType: 'text',
                cache: false,
                global: true,
                async: true,
                success: function(data,status,xhr) {
                    data = "\ufeff" + data;
                    var $a = document.createElement("a");
                    var _blob = new Blob([data], { type: 'text/csv,charset=UTF-8' });
                    var url = window.URL.createObjectURL(_blob);
                    var filename = xhr.getResponseHeader('Content-Disposition').split("=")[1];
                    filename = filename.substring(0,filename.length-1);
                    $a.download = filename
                    $a.href = url
                    $a.click()
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            })
        })

        // 送出新增
        $('#ins').on('click', function () {
            //防連點
            let that = $(this);
            $(that).attr('disabled', true);
            setTimeout(function () {
                $(that).attr('disabled', false);
            }, 3000);
            var loginForm = $('#form-main').serializeArray()

            $.ajax({
                type: 'POST',
                url: '/Demand_ajax/create_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('新增成功')
                        location.href = window._JS_BASEURL + 'Demand/edit?PostData=' + callback.result
                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                    location.href = window._JS_BASEURL
                },
            })
        })

        //更新表單
        $('#upt').on('click', function () {
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Demand_ajax/update_order',
                cache: false,
                processData: false,
                contentType: false,
                data: send_data_,
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']

                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍候再嘗試。')
                },
            })
        })

        //單號取消
        $('#cancel').on('click', function () {
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            } else {
                var sysid = 'SysData=' + id.join(',')
            }

            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Demand_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid),
                },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功')
                        location.href = window._JS_BASEURL + 'Demand'
                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍候再嘗試。')
                },
            })
        })

        //將checkbox設定為radio
        $('input:checkbox').on('click', function () {
            var $box = $(this)
            if ($box.is(':checked')) {
                var group = "input:checkbox[name='" + $box.attr('name') + "']"

                $(group).prop('checked', false)
                $box.prop('checked', true)
            } else {
                $box.prop('checked', false)
            }
        })

        //設定密碼詢問視窗按enter之行為
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
    add_person: function add_person(Name) {
        $(this).removeData('modal')
        save_method = 'add'
        $('#form')[0].reset() // reset form on modals
        $('.form-group').removeClass('has-error') // clear error class
        $('.help-block').empty() // clear errorF string
        $('#modal_form').modal('show') // show bootstrap modal
        TableName = Name
    },

}

jQuery(document).ready(function () {
    Page.init()
    var TableName = ''
})

//複選框點擊事件
function GetIds() {
    //獲取所有複選框
    $("input:checkbox[name='checklist']").each(function () {
        var v = $(this).val()

        //被選中的複選框
        if (this.checked) {
            if (id.toString() == '') {
                //往數组里面添加值
                id.push(v)
            }

            //判断id數组中是否含有你以前存入的元素，没有就新增
            else {
                if ($.inArray(v, id) < 0) {
                    id.push(v)
                }
            }
        }

        //未被選重的複選框
        else {
            if ($.inArray(v, id) > -1) {
                id.splice($.inArray(v, id), v.length)
            }
        }
    })
}

let dataEdit = () => {
    return {
        demand_git: git,
        add_git: '',
        add_git_notice: '',
        line_flag: true,
        save_git() {
            if(this.git_flag === true && this.add_git === ''){
                alert('請填寫git版號');
                return;
            }
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Demand_ajax/update_order',
                cache: false,
                processData: false,
                contentType: false,
                data: send_data_,
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']

                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍候再嘗試。')
                },
            })
        },
    }
}



