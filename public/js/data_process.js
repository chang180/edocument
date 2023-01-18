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
                var data_url = '/Data_process/getList'
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
                            row.data_sys_id +
                            '" id="' +
                            row.data_sys_id +
                            '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' +
                            row.data_sys_id +
                            '"></label></div>'
                        )
                    },
                },
                {
                    title: '單號',
                    data: 'data_order_no',
                },
                {
                    title: '申請人',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.data_applicant_name + '(' + row.data_applicant.split('|')[0] + ')</span>'
                    },
                },
                {
                    title: '簽核進度',
                    data: 'data_process',
                },
                {
                    title: '申請單位',
                    data: 'data_dept',
                },
                {
                    title: '建立日期',
                    data: 'data_create_time',
                },
                {
                    title: '詳細資料',
                    render: function (data, type, row, meta) {
                        return (
                            '<a class="btn btn-sm btn-secondary" href="' +
                            window._JS_BASEURL +
                            'Data_process/edit?PostData=' +
                            row.data_sys_id +
                            '&check_sign=' +
                            check_sign +
                            '"><i class="fa fa-list-alt"></i>詳細資料</a>'
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
                sData_process:
                    "<i class='far fa-list-alt text-info'></i> <span class='text-info'>顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆</span>",
                sData_processEmpty:
                    "<span class='text-info'>顯示第 0 至 0 項結果，共 0 項</span>",
                sData_processFiltered: '(由 _MAX_ 项结果过滤)',
                sData_processPostFix: '',
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
            maxDate: 'today',
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

        // 設定資料使用申請單申請區間
        flatpickr('.datepicker', {
            locale: 'zh',
            dateFormat: "Y-m-d H:i:S",
            enableTime: true,
            enableSeconds: true,
            defaultHour: 0,
            // maxDate: 'today',
            onChange: function (selected, dt, inst) {
                var startDate = $('#start_time').val()
                var endDate = $('#end_time').val()
                //截止日大於起始日
                if (
                    startDate !== '' &&
                    inst.element.id === 'end_time' &&
                    dt < startDate
                ) {
                    $('#end_time').val(startDate)
                    $('#start_time').val(dt)
                }
                //起始日小截止日
                if (
                    endDate !== '' &&
                    inst.element.id === 'start_time' &&
                    dt > endDate
                ) {
                    $('#end_time').val(dt)
                    $('#start_time').val(endDate)
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
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Data_process/update_order',
                cache: false,
                contentType: false,
                processData: false,
                data: send_data_,
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Data_process/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    } else {
                        alert('更新失敗  ' + callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，或檔案大小超過限制。')
                },
            })
        })

        //刪除
        $('#soft_del').on('click', function () {
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Data_process/delete_order',
                cache: false,
                contentType: false,
                processData: false,
                data: send_data_,
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('取消成功')
                        location.href =
                            window._JS_BASEURL +
                            'Data_process/cancelled'
                    } else {
                        alert('取消失敗')
                        location.href =
                            window._JS_BASEURL +
                            'Data_process/cancelled'
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，或檔案大小超過限制。')
                },
            })
        })

        //申請人簽核
        $('#applicant_approve').on('click', function () {
            if (parameter.value === '') {
                alert('請輸入資料/欄位歷程/參數')
                return
            }
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
            reverse_desc += `${reason}(${result.data_applicant_leader_name})(${time_record})<br>`
            Tool.reverse('applicant_leader')
            // }
        })

        //部門主管簽核
        $('#supervisor').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('supervisor')
            } else {
                Tool.add_person('supervisor')
            }
        })

        //部門主管取消簽核
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
            reverse_desc += `${reason}(${result.data_supervisor_name})(${time_record})<br>`
            Tool.reverse('supervisor')
            // }
        })

        //副總經理代理簽核
        $('#vicegm').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('vicegm')
            } else {
                Tool.add_person('vicegm')
            }
        })

        //執行人員簽核，簽核時同時將簽核狀況寫入資料庫，若簽核時執行狀況為空值，則警示需完成填寫
        $('#executor').on('click', function () {
            if ($('#result').val() == '') {
                alert('請完成執行狀況填寫')
            } else {
                //檢查是否有第1次簽核記錄，並進行簽核，同時將執行狀況加入更新
                if (check_verification == '1') {
                    $('#signoff_result').val($('#result').val())
                    // 防止連點
                    let that = $(this);
                    $(that).attr('disabled', true);
                    setTimeout(function () {
                        $(that).attr('disabled', false);
                    }, 3000);
                    Tool.direct('executor')
                } else {
                    Tool.add_person('executor')
                }
            }
        })

        //執行人員取消簽核
        $('#executor_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${result.data_executor_name})(${time_record})<br>`
            Tool.reverse('executor')
            // }
        })

        //驗收人員簽核
        $('#acceptance').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('acceptance')
            } else {
                Tool.add_person('acceptance')
            }
        })

        //驗收人員取消簽核
        $('#acceptance_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${result.data_acceptance_name})(${time_record})<br>`
            Tool.reverse('acceptance')
            // }
        })

        //執行單位主管簽核
        $('#executor_leader').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('executor_leader')
            } else {
                Tool.add_person('executor_leader')
            }
        })

        //執行單位主管取消簽核
        $('#executor_leader_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${result.data_executor_leader_name})(${time_record})<br>`
            Tool.reverse('executor_leader')
        })


        //執行單位部門主管簽核
        $('#executor_supervisor').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('executor_supervisor')
            } else {
                Tool.add_person('executor_supervisor')
            }
        })

        //執行單位主管取消簽核
        $('#executor_supervisor_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${result.data_executor_supervisor_name})(${time_record})<br>`
            Tool.reverse('executor_supervisor')
            // }
        })

        //列印
        $('#download').on('click', function () {
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            }

            window.open(
                window._JS_BASEURL +
                'PrintContent/Data_process?PostData=' +
                Basic._webBaseEncode('SysData=' + id.join(',')), "_blank")
        })

        $('#print').on('click', function () {
            window.open(
                window._JS_BASEURL +
                'PrintContent/Data_process?PostData=' +
                Basic._webBaseEncode('SysData=' + print_id), "_blank")
        })

        //單號取消
        $('#cancel').on('click', function () {

            if (id.length == 0) {
                alert('未勾選項目')
                return false
            } else {
                // if (confirm("請確定是否取消選取單號") == false) return
                answer = prompt("請輸入取消說明")
                if (answer == null || answer == "") return
                var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|/=+—“”‘"
                for (i = 0; i < answer.length; i++) {
                    if (SPECIAL_STR.indexOf(answer.charAt(i)) != -1) {
                        alert("請勿輸入特殊字元(" + answer.charAt(i) + ")!")
                        return
                    }
                }
                let time_record = moment().format('YYYY-MM-DD HH:mm')
                if (answer == null || answer == "") return
                else var sysid = 'SysData=' + id.join(',') + '&Username=' + answer + '(' + Username + ')(' + time_record + ')<br>'
            }

            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Data_process/cancelOrder',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid)
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功')
                        location.href = window._JS_BASEURL + 'Data_process'
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
    getData_processrmation: function getData_processrmation(id) {
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
        var send_data_ = new FormData($('#form-main')[0])

        send_data_.append('pw', pw)

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Data_process/create_order',
            cache: false,
            contentType: false,
            processData: false,
            data: send_data_,
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
                            window._JS_BASEURL + 'Data_process/edit?PostData=' + callback.result
                    }
                } else {
                    if (typeof callback.message !== 'undefined') {
                        alert(callback.message)
                    } else {
                        alert('請重新登入')
                        location.href =
                            window._JS_BASEURL + 'Data_process'
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
    },
    //快速新增表單
    direct_ins: function direct_ins() {
        var send_data_ = new FormData($('#form-main')[0])

        send_data_.append('pw', pw)
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Data_process/create_order',
            cache: false,
            contentType: false,
            processData: false,
            data: send_data_,
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
                            window._JS_BASEURL + 'Data_process/edit?PostData=' + callback.result
                    }
                } else {
                    if (typeof callback.message !== 'undefined') {
                        alert(callback.message)
                    } else {
                        alert('請重新登入')
                        location.href =
                            window._JS_BASEURL + 'Data_process'
                    }
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

        signOffForm.push({
            name: 'pw',
            value: pw,
        })
        var Data_processData = signOffForm

        Data_processData.push({
            name: 'signoff',
            value: TableName,
        })
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Data_process/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(Data_processData)),
            },
            success: function (callback, status, xhr) {
                // console.log(callback)
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
                                window._JS_BASEURL + 'Data_process?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Data_process/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                        }
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Data_process/edit?PostData=' +
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
        loginForm[4] = { name: 'order_no', value: order_no }

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Data_process/sign_off_reverse',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                if (callback.status === 'SUCCESS') {
                    alert('取消成功')
                    if (
                        callback.result.check_sign == '1' &&
                        callback.result.SysData != null
                    ) {
                        location.href =
                            window._JS_BASEURL + 'Data_process?PostData=' + callback.result.SysData
                    } else {
                        location.href =
                            window._JS_BASEURL +
                            'Data_process/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後再嘗試。')
            },
        })
    },
    // 直接簽核
    direct: function direct(Name) {
        var loginForm = []
        loginForm[0] = { name: 'signoff', value: Name }
        loginForm[1] = { name: 'sys_id', value: sys_id }
        loginForm[2] = { name: 'group_id', value: group_id }
        loginForm[3] = { name: 'process', value: process }
        loginForm[4] = { name: 'order_no', value: order_no }
        loginForm[5] = { name: 'check_sign', value: check_sign }
        loginForm[6] = { name: 'dept', value: dept }
        loginForm[7] = { name: 'creator', value: creator }
        loginForm[8] = { name: 'result', value: $('#result').val() }

        var Data_processData = loginForm
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Data_process/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(Data_processData)),
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
                                window._JS_BASEURL + 'Data_process/edit?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Data_process/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                            // location.href = window._JS_BASEURL + 'Data_process'
                        }
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Data_process/edit?PostData=' +
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

        //未被選中的複選框
        else {
            if ($.inArray(v, id) > -1) {
                id.splice($.inArray(v, id), v.length)
            }
        }
    })
}

//過濾主題之輸入，以避免之後查詢時發生錯誤
$('#title').change(function () {
    // <input type = "text" value = "" id = "inputvalue" onblur ="checkSpecialCharacter(this)" >
    /**過濾表單中的特殊字元*/

    var str = $('#title').val()
    var SPECIAL_STR = "￥#$~!@%^&;*();'/\"?><[]{}//|:/=+—“”‘"
    for (i = 0; i < str.length; i++) {
        if (SPECIAL_STR.indexOf(str.charAt(i)) != -1) {
            alert("主題用於搜索，請勿輸入特殊字元(" + str.charAt(i) + ")!")
            $('#title').val(title)
            $('#title').focus()
            return false
        }
    }
    return true;
})

// 編輯頁面之x-data
let dataEdit = () => {
    return {
        nw_depts: ['1', '11', '15', '16', '17', '18', '25'], //藍新RD部門
        ez_depts: ['7'],  //簡單RD部門
        cs_depts: ['3', '4', '9'], //群心部門
        etc_depts: ['2', '3', '4', '5', '6', '8', '9', '10', '12', '13', '14', '19', '20', '21', '22', '23', '24'], //其他部門
        group: result.data_group_id,
        creator: result.data_creator,
        platform: result.data_platform,
        type: result.data_type.split('|')[0],
        setup: result.data_type.split('|')[1],
        item: result.data_item.split('|')[0],
        param: result.data_item.split('|')[1],
        number: result.data_item.split('|')[2],
        start_time: result.data_start_time,
        end_time: result.data_end_time,
        datepicker: result.data_start_time !== null,
        datepicker1: ['1', '2'].includes(result.data_request_type),
        datepicker2: result.data_exec_time !== null,
        data_source: result.data_source,
        request_type: result.data_request_type,
        request_time: result.data_request_time,
        sequence: result.data_sequence,
        attach: result.data_attach,
        attach_page: result.data_attach_page,
        redmine: result.data_redmine,
        area: result.data_area,
        recipient: result.data_recipient,
        ext: result.data_ext,
        email: result.data_email,
        exec_time: result.data_exec_time,
        file: result.data_file,
        file_name: result.data_file_name,
        file_time: result.data_file_time,
        canEdit: false,
        special1: result.data_special.split('|')[0]?true:false,
        special2: result.data_special.split('|')[1]?true:false,
        check_source(value) {
            if ($('#data_source' + value).prop('checked') === true) {
                this.data_source = '';
                $('#data_source' + value).prop('checked', false);
            }
        },
        check_type(value) {
            this.datepicker1 = true;
            if ($('#request_type' + value).prop('checked') === true) {
                this.request_type = '';
                this.datepicker1 = false;
                $('#request_type' + value).prop('checked', false);
            }
        },
        check_file(value) {
            if (this.$refs.newFile.files.length === 1 && value === 0) {
                $('#file_name').wrap('<form>').closest('form').get(0).reset();
                this.file = '0';
            } else if (this.$refs.newFile.files.length === 0 && value === 1) {
                $('#file_name').click();
                $('#file_no').prop('checked', true);
            }
        },
        change_state() {
            if (this.$refs.newFile.files.length === 1) {
                if (this.$refs.newFile.files[0].size > 104857600) {
                    $('#file_no').prop('checked', true)
                    this.file = '0';
                    this.file_name = '';
                    this.filetime = '';
                    $('#file_name').wrap('<form>').closest('form').get(0).reset();
                    alert('檔案大小超過100MB，請重新選擇');
                    return
                } else {
                    $('#file_yes').prop('checked', true)
                    this.file = '1';
                    this.file_name = this.$refs.newFile.files[0].name;
                }
            } else {
                if (result.data_file_name) {
                    $('#file_yes').prop('checked', true)
                    this.file = '1';
                    this.file_name = result.data_file_name;
                } else {
                    $('#file_no').prop('checked', true)
                    this.file = '0';
                    this.file_name = '';
                    this.filetime = '';
                }
            }
        },
        checkEditable() {
            if (
                this.creator == login_id && result.data_process === '1'
                || this.creator == login_id && result.data_is_enabled === '0'
                || result.data_process === '5' && executors.includes(login_id)) {
                this.canEdit = true;
                $('#form-main input').prop('disabled', false);
                $('textarea').prop('readonlly', true);
            } else {
                this.canEdit = false;
                $('#form-main input').prop('disabled', true);
                $('textarea').prop('readonly', true);

            }
        }
    }
}

// 新增頁面之x-data資料
let dataCreate = () => {
    return {
        group: group.toString(),
        creator: Name,
        platform: '1',
        type: '0',
        setup: '0',
        number: 0,
        item: '0',
        redmine: '0',
        datepicker: false,
        datepicker1: false,
        datepicker2: false,
        data_source: '',
        request_type: '',
        attach: 0,
        file: 0,
        check_source(value) {
            if ($('#source' + value).prop('checked') === true) {
                this.data_source = '';
                $('#source' + value).prop('checked', false);
            }
        },
        check_type(value) {
            if (this.request_type === value.toString()) {
                this.request_type = '';
                this.datepicker1 = false;
                $('#request_type' + value).prop('checked', false);
            } else {
                this.datepicker1 = true;
            }
        },
        check_file(value) {
            if (this.$refs.newFile.files.length === 1 && value === 0) {
                $('#file_name').wrap('<form>').closest('form').get(0).reset();
            } else if (this.$refs.newFile.files.length === 0 && value === 1) {
                $('#file_name').click();
                $('#file_no').prop('checked', true);
            }
        },
        change_state() {
            if (this.$refs.newFile.files.length === 1) {
                if (this.$refs.newFile.files[0].size > 104857600) {
                    $('#file_no').prop('checked', true)
                    this.file = '0';
                    this.file_name = '';
                    this.filetime = '';
                    $('#file_name').wrap('<form>').closest('form').get(0).reset();
                    alert('檔案大小超過100MB，請重新選擇');
                    return
                } else {
                    $('#file_yes').prop('checked', true)
                    this.file = '1';
                    this.file_name = this.$refs.newFile.files[0].name;
                }
            } else {
                $('#file_no').prop('checked', true)
                this.file = '0';
                this.file_name = '';
                this.filetime = '';
            }

        },
        check_content() {
            if (!$('#redmine_subject').val()) {
                alert('建立redmine需輸入主題');
                $('#redmine_type0').prop('checked', true);
            }
        }
    }
}
