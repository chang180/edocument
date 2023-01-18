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
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: 'full_numbers',
            bSort: true,
            aaSorting: [[5, 'desc']],
            ajax: function (data, callback, settings) {
                var data_url = '/Deploy_ajax/get_deploy_list'
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
                        return (
                            '<div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input" name="checklist" value="' +
                            row.dp_sys_id +
                            '" id="' +
                            row.dp_sys_id +
                            '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' +
                            row.dp_sys_id +
                            '"></label></div>'
                        )
                    },
                },
                {
                    title: '單號',
                    data: 'dp_order_no',
                },
                {
                    title: '申請單位',
                    data: 'dp_group_id',
                },
                {
                    title: '申請人',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.mb_user_name + '(' + row.dp_creator + ')</span>'
                    },
                },
                {
                    title: '簽核進度',
                    data: 'dp_process',
                },

                {
                    title: '建立日期',
                    data: 'dp_create_time',
                },
                {
                    title: '詳細資料',
                    render: function (data, type, row, meta) {
                        return (
                            '<a class="btn btn-sm btn-secondary" href="' +
                            window._JS_BASEURL +
                            'Deploy/edit?PostData=' +
                            row.dp_sys_id +
                            '&check_sign=' +
                            check_sign +
                            '"><i class="fa fa-list-alt"></i> 詳細資料</a>'
                        )
                    },
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

        //更新
        $('#upt').on('click', function () {
            var loginForm = $('#form-main').serializeArray()
            $.ajax({
                type: 'POST',
                url: '/Deploy_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
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
            $.ajax({
                type: 'POST',
                url: '/Deploy_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
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

        //原碼檢測人員簽核 
        $('.code_review').on('click', function () {
            //簽核時，重載整個頁面，以獲取當前最新簽核狀態，重載時將本欄資料傳送至本頁
            //重載後，同時將reviewer欄位清空，以消除通知，並將簽核人欄位填入

            location.href += "&sign=" + $(this).val()
        })

        //原碼檢測人員取消 
        $('.code_review_reverse').on('click', function () {
            //簽核時，重載整個頁面，以獲取當前最新簽核狀態，重載時將本欄資料傳送至本頁
            //重載後，同時將reviewer欄位清空，以消除通知，並將簽核人欄位填入
            location.href += "&reverse=" + $(this).val()
        })

        //申請人簽核
        $('#applicant_approve').on('click', function () {
            if (check_verification == '1') {
                Tool.direct_ins('applicant')
            } else {
                Basic.add_person('applicant')
            }
        })

        //申請單位主管簽核
        $('#applicant_leader').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('applicant_leader')
            } else {
                Tool.add_person('applicant_leader')
            }
        })

        //申請單位主管取消簽核
        $('#applicant_leader_reverse').on('click', function () {
            //防止連點
            let that = $(this);
            $(that).attr('disabled', true);
            setTimeout(function () {
                $(that).attr('disabled', false);
            }, 3000);
            do {
                var reason = prompt("請輸入取消說明(必填)")
            } while (reason !== null && reason === "")

            var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
            for (i = 0; i < reason?.length; i++) {
                if (SPECIAL_STR.indexOf(reason.charAt(i)) != -1) {
                    alert("請勿輸入特殊字元(" + reason.charAt(i) + ")!")
                    return
                }
            }
            if (reason == null || reason == "") return
            // else {
            reverse_desc += `${reason}(${applicant_leader})(${time_record})<br>`
            Tool.reverse('applicant_leader')
            // }
        })

        //技術資訊單位主管簽核
        $('#supervisor').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('supervisor')
            } else {
                Tool.add_person('supervisor')
            }
        })

        //技術資訊單位主管取消簽核
        $('#supervisor_reverse').on('click', function () {
            do {
                var reason = prompt("請輸入取消說明(必填)")
            } while (reason !== null && reason === "")

            var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
            for (i = 0; i < reason?.length; i++) {
                if (SPECIAL_STR.indexOf(reason.charAt(i)) != -1) {
                    alert("請勿輸入特殊字元(" + reason.charAt(i) + ")!")
                    return
                }
            }
            if (reason == null || reason == "") return
            // else {
            reverse_desc += `${reason}(${supervisor})(${time_record})<br>`
            Tool.reverse('supervisor')
            // }
        })


        //產品規劃單位主管簽核
        $('#pm_leader').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('pm_leader')
            } else {
                Tool.add_person('pm_leader')
            }
        })

        //產品規劃單位主管取消簽核
        $('#pm_leader_reverse').on('click', function () {
            do {
                var reason = prompt("請輸入取消說明(必填)")
            } while (reason !== null && reason === "")

            var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
            for (i = 0; i < reason?.length; i++) {
                if (SPECIAL_STR.indexOf(reason.charAt(i)) != -1) {
                    alert("請勿輸入特殊字元(" + reason.charAt(i) + ")!")
                    return
                }
            }
            if (reason == null || reason == "") return
            // else {
            reverse_desc += `${reason}(${pm_leader})(${time_record})<br>`
            Tool.reverse('pm_leader')
            // }
        })

        //營運管理單位主管簽核
        $('#op_leader').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('op_leader')
            } else {
                Tool.add_person('op_leader')
            }
        })

        //營運管理單位主管取消簽核
        $('#op_leader_reverse').on('click', function () {
            do {
                var reason = prompt("請輸入取消說明(必填)")
            } while (reason !== null && reason === "")

            var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
            for (i = 0; i < reason?.length; i++) {
                if (SPECIAL_STR.indexOf(reason.charAt(i)) != -1) {
                    alert("請勿輸入特殊字元(" + reason.charAt(i) + ")!")
                    return
                }
            }
            if (reason == null || reason == "") return
            // else {
            reverse_desc += `${reason}(${op_leader})(${time_record})<br>`
            Tool.reverse('op_leader')
            // }
        })

        //資訊安全部門歸檔簽核
        $('#ss').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('ss')
            } else {
                Tool.add_person('ss')
            }
        })

        //資訊安全部門取消簽核
        $('#ss_reverse').on('click', function () {
            do {
                var reason = prompt("請輸入取消說明(必填)")
            } while (reason !== null && reason === "")

            var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
            for (i = 0; i < reason?.length; i++) {
                if (SPECIAL_STR.indexOf(reason.charAt(i)) != -1) {
                    alert("請勿輸入特殊字元(" + reason.charAt(i) + ")!")
                    return
                }
            }
            if (reason == null || reason == "") return
            // else {
            reverse_desc += `${reason}(${ss})(${time_record})<br>`
            Tool.reverse('ss')
            // }
        })

        //副總經理簽核
        $('#vicegm').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('vicegm')
            } else {
                Tool.add_person('vicegm')
            }
        })

        //文件會簽
        $('#countersign').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('countersign')
            } else {
                Tool.add_person('countersign')
            }
        })

        //列印
        $('#download').on('click', function () {
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            }

            window.open(
                window._JS_BASEURL +
                'PrintContent/Deploy?PostData=' +
                Basic._webBaseEncode('SysData=' + id.join(',')), "_blank")
        })

        $('#print').on('click', function () {
            window.open(
                window._JS_BASEURL +
                'PrintContent/Deploy?PostData=' +
                Basic._webBaseEncode('SysData=' + print_id), "_blank")
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
                url: window._JS_BASEURL + 'Deploy_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid),
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功')
                        location.href = window._JS_BASEURL + 'Deploy'
                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                },
            })
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
        $('.help-block').empty() // clear error string
        $('#modal_form').modal('show') // show bootstrap modal
        TableName = Name
    },

    //新增表單&簽核驗證
    ins: function ins() {
        var pw = $('#pw').val() || null
        if (pw === null) {
            alert('請輸入密碼')
            return false
        }
        var loginForm = $('#form-main').serializeArray()
        loginForm.push({
            name: 'pw',
            value: pw,
        })

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Deploy_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    if (callback.flag === true) {
                        alert('新增成功,你需填寫文件簽核申請表')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/create?PostData=' +
                            callback.PostData
                    } else {
                        alert('新增成功')
                        location.href =
                            window._JS_BASEURL + 'Deploy/edit?PostData=' + callback.result
                    }
                } else {
                    alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
    },
    //快速新增表單
    direct_ins: function direct_ins() {
        var loginForm = $('#form-main').serializeArray()
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Deploy_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    if (callback.flag === true) {
                        alert('新增成功,你需填寫文件簽核申請表')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/create?PostData=' +
                            callback.PostData
                    } else {
                        alert('新增成功')
                        location.href =
                            window._JS_BASEURL + 'Deploy/edit?PostData=' + callback.result
                    }
                } else {
                    alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
    },

    //簽名驗證
    save: function save() {
        var isclick = true
        var pw = $('#pw').val() || null
        var SysId = $('#sys_id').val() || null
        if (pw === null) {
            alert('請輸入密碼')
            return false
        }

        var signOffForm = $('#form').serializeArray()
        var loginForm = $('#form-main').serializeArray()
        var InfoData = signOffForm.concat(loginForm)

        InfoData.push({
            name: 'signoff',
            value: TableName,
        })
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Deploy_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    if (
                        callback.result.flag === true &&
                        callback.result.is_enable === true
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/edit?PostData=' +
                            callback.result.sys_id +
                            '&date_status=1'
                    } else if (
                        callback.result.flag === true &&
                        callback.result.is_enable === false
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/create?PostData=' +
                            callback.result.PostData
                    } else {
                        alert('更新成功')
                        if (
                            callback.result.check_sign == '1' &&
                            callback.result.SysData != null
                        ) {

                            location.href =
                                window._JS_BASEURL + 'Deploy?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Deploy/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                            // location.href = window._JS_BASEURL + 'Deploy'
                        }
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Deploy/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
    },
    //簽核取消
    reverse: function reverse(Name) {
        var loginForm = []
        loginForm[0] = { name: 'signoff', value: Name }
        loginForm[1] = { name: 'sys_id', value: sys_id }
        loginForm[2] = { name: 'reverse', value: reverse_desc }
        loginForm[3] = { name: 'process', value: process }

        var signOffForm = $('#form-main').serializeArray()
        var InfoData = loginForm.concat(signOffForm)

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Deploy_ajax/sign_off_reverse',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    alert('取消成功')
                    if (
                        callback.result.check_sign == '1' &&
                        callback.result.SysData != null
                    ) {
                        location.href =
                            window._JS_BASEURL + 'Deploy?PostData=' + callback.result.SysData
                    } else {
                        location.href =
                            window._JS_BASEURL +
                            'Deploy/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Deploy/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後在嘗試。')
            },
        })
    },
    direct: function direct(Name) {
        var loginForm = []
        loginForm[0] = { name: 'signoff', value: Name }
        loginForm[1] = { name: 'sys_id', value: sys_id }
        loginForm[2] = { name: 'group_id', value: group_id }
        loginForm[3] = { name: 'process', value: process }
        loginForm[4] = { name: 'order_no', value: order_no }
        loginForm[5] = { name: 'creator', value: creator }
        loginForm[6] = { name: 'check_sign', value: check_sign }
        // loginForm[7] = { name: 'dept', value: dept }

        var signOffForm = $('#form-main').serializeArray()
        var InfoData = loginForm.concat(signOffForm)
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Deploy_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    if (
                        callback.result.flag === true &&
                        callback.result.is_enable === true
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/edit?PostData=' +
                            callback.result.sys_id +
                            '&date_status=1'
                    } else if (
                        callback.result.flag === true &&
                        callback.result.is_enable === false
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href =
                            window._JS_BASEURL +
                            'SignOff/create?PostData=' +
                            callback.result.PostData
                    } else {
                        alert('更新成功')
                        if (
                            callback.result.check_sign == '1' &&
                            callback.result.SysData != null
                        ) {
                            location.href =
                                window._JS_BASEURL + 'Deploy?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Deploy/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                            // location.href = window._JS_BASEURL + 'Deploy'
                        }
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Deploy/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
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

// 上版單編輯時之x-data資料
let dataEdit = () => {
    return {
        count: 0,
        temp_reviewer: '',
        reviewer_list: '',
        reviewer_count: 0,
        deploy_appointed_reviewer_name: '',
        deploy_appointed_reviewer: '',
        // 取得原碼檢測人列表
        get_reviewer_list() {
            let _this = this
            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Deploy_ajax/code_reviewer',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(login_id + "_" + group_id)),
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        _this.reviewer_list = callback.result;
                        $('#appointReviewer').modal('show');
                    } else {
                        alert(callback.message);
                        $('#appointReviewer').modal('hide');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍候再嘗試。')
                    $('#appointReviewer').modal('hide');
                },
            })
        },
        //選定原碼檢測人後，重新導頁並傳入修改值
        save_reviewer(){
            location.href += "&appointed_reviewer=" + this.temp_reviewer + "&appointed_reviewer_value=" + this.reviewer_count
        }
    }
}

//指定原碼檢測人
if (typeof appointed_reviewer != "undefined") appoint_reviewer(appointed_reviewer, appointed_reviewer_value)

function appoint_reviewer() {
    //避免指定時已簽核
    if ($('#review' + appointed_reviewer_value).parent().next().find('input').val() != '') {
        alert('原碼檢測人已簽核')
        location.href =
            window._JS_BASEURL +
            'Deploy/edit?PostData=' +
            Basic.getUrlVars()['PostData'] +
            '&check_sign=' +
            Basic.getUrlVars()['check_sign']
    }
    //選定原碼檢測人後，將輸入欄位值改為選擇之值
    $('#review' + appointed_reviewer_value).val(appointed_reviewer)
    let code_reviewer = appointed_reviewer

    // 將簽核進度設定為1，以免結束原碼檢測人簽核狀態
    $('#process').val('1')
    var loginForm = $('#form-main').serializeArray()

    //將指定之簽核人員加入表單以進行email通知
    loginForm.push({
        name: 'mail_notify',
        value: code_reviewer
    })
    $.ajax({
        type: 'POST',
        url: '/Deploy_ajax/update_order',
        cache: false,
        data: {
            send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
        },
        success: function (callback, status, xhr) {
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
}

//原碼檢測人簽核
if (typeof sign != "undefined") code_reviewer_sign(sign)
function code_reviewer_sign(sign) {
    if (
        $('#' + sign).nextAll('input').val() != ""
    ) {
        alert('本欄位已有簽核記錄')
        location.href =
            window._JS_BASEURL +
            'Deploy/edit?PostData=' +
            Basic.getUrlVars()['PostData'] +
            '&check_sign=' +
            Basic.getUrlVars()['check_sign']
        // location.href = window._JS_BASEURL + 'Deploy'
    }
    $('#' + sign).parent().prev().find('input:last-child').val('')
    $('#' + sign).nextAll('input').val(code_reviewer)
    // return
    var loginForm = $('#form-main').serializeArray()
    //登入後首次簽核需輸入密碼
    if (check_verification == '1') {
        Tool.direct('code_reviewer')
    } else {
        Tool.add_person('code_reviewer')
    }
}

//原碼檢測人簽核取消
if (typeof reverse != "undefined") code_reviewer_reverse(reverse)
function code_reviewer_reverse(reverse) {

    if (
        $('#' + reverse).nextAll('input').val() == ""
    ) {
        alert('本欄位已無簽核記錄')
        location.href =
            window._JS_BASEURL +
            'Deploy/edit?PostData=' +
            Basic.getUrlVars()['PostData'] +
            '&check_sign=' +
            Basic.getUrlVars()['check_sign']
        // location.href = window._JS_BASEURL + 'Deploy'
        return
    }
    if (
        process > 2
    ) {
        alert('下一級單位已簽核')
        location.href =
            window._JS_BASEURL +
            'Deploy/edit?PostData=' +
            Basic.getUrlVars()['PostData'] +
            '&check_sign=' +
            Basic.getUrlVars()['check_sign']
        // location.href = window._JS_BASEURL + 'Deploy'
        return
    }
    //將原負責人填回，以使其可再度指定原碼檢測人
    $('#' + reverse).parent().prev().find('input:last-child').val($('#' + reverse).parent().prev().prev().find('input:first-child').val())
    $('#' + reverse).nextAll('input').val('')


    // return
    var loginForm = $('#form-main').serializeArray()


    Tool.reverse('code_review_reverse')
}

//單筆紀錄移除
$('.erase').click(function () {
    let that = $(this)
    let timeleft = 10
    $('#eraseRecord').click()
    let timeout = setInterval(function () {
        $('#timeleft').text('(' + timeleft + '秒)')
        timeleft--
        if (timeleft < 0) {
            clearInterval(timeout)
            $('#cancelErase').click()
        }
    }, 1000)
    $('#confirmErase').on('click', function () {
        clearInterval(timeout)
        $(that).closest('tr').remove()
        $('#cancelErase').click()
        $('#upt').click()
    })
    $('#cancelErase').on('click', function () {
        clearInterval(timeout)
    })
})

//自動上版程序
$('#auto-procedure').click(function () {
    $.ajax({
        type: 'POST',
        url: '/Deploy_ajax/auto_procedure',
        cache: false,
        data: {
        }
    }).done(function (callback) {
        alert(callback.message)
    })
})

// 設定自動上版簽核人員
$('#set-signer').click(function () {
    $.ajax({
        type: 'POST',
        url: '/Deploy_ajax/get_signer_list',
        cache: false,
        data: {
        }
    }).done(function (callback) {
        $('#1').val(callback[1])
        $('#2').val(callback[2])
        $('#3').val(callback[3])
    })
    $('#signer').modal('show');
})

$('#save-signer').click(function () {
    $.ajax({
        type: 'POST',
        url: '/Deploy_ajax/set_signer',
        cache: false,
        data: {
            '1': $('#1').val(),
            '2': $('#2').val(),
            '3': $('#3').val(),
        }
    }).done(function (callback) {
        alert('已完成設定')
        $('#signer').modal('hide');
    })
})

