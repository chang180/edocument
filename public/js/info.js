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
                { "width": "28%", "targets": 2 },
                { "orderable": false, "targets": [2, 3, 4, 5, 7] },
            ],
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: 'full_numbers',
            bSort: true,
            aaSorting: [[6, 'desc']],
            ajax: function (data, callback, settings) {
                var data_url = '/Info_ajax/get_info_list'
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
                        alert('網路可能不夠順暢，請稍後在嘗試。')
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
                            row.in_sys_id +
                            '" id="' +
                            row.in_sys_id +
                            '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' +
                            row.in_sys_id +
                            '"></label></div>'
                        )
                    },
                },
                {
                    title: '單號',
                    data: 'in_order_no',
                },
                {
                    title: '主題',
                    data: 'in_title',
                },
                {
                    title: '申請人',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.mb_user_name + '(' + row.in_creator + ')</span>'
                    },
                },
                {
                    title: '簽核進度',
                    data: 'in_process',
                },
                {
                    title: '申請單位',
                    data: 'in_dept',
                    // orderable: false,
                    // render: function (data, type, row, meta) {
                    //     switch (row.in_group_id) {
                    //         case '1':
                    //             return '<span>簡單</span>'
                    //             break
                    //         case '2':
                    //             return '<span>藍新</span>'
                    //             break
                    //         case '3':
                    //             return '<span>威肯</span>'
                    //             break
                    //         default:
                    //             return ''
                    //             break
                    //     }
                    // },
                },
                {
                    title: '建立日期',
                    data: 'in_create_time',
                },
                {
                    title: '詳細資料',
                    render: function (data, type, row, meta) {
                        return (
                            '<a class="btn btn-sm btn-secondary" href="' +
                            window._JS_BASEURL +
                            'Info/edit?PostData=' +
                            row.in_sys_id +
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
            // var loginForm = $('#form-main').serializeArray()
            // console.log(loginForm)
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Info_ajax/update_order',
                cache: false,
                contentType: false,
                processData: false,
                data: send_data_,
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Info/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                    } else {
                        alert('更新失敗')
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，或檔案大小超過限制。')
                },
            })
        })

        //刪除
        $('#soft_del').on('click', function () {
            // var loginForm = $('#form-main').serializeArray()
            // console.log(loginForm)
            var send_data_ = new FormData($('#form-main')[0])
            $.ajax({
                type: 'POST',
                url: '/Info_ajax/delete_order',
                cache: false,
                contentType: false,
                processData: false,
                data: send_data_,
                // data: {
                //     send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                // },
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('取消成功')
                        location.href =
                            window._JS_BASEURL +
                            'Info/cancelled'
                    } else {
                        alert('取消失敗')
                        location.href =
                            window._JS_BASEURL +
                            'Info/cancelled'
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，或檔案大小超過限制。')
                },
            })
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

        //會簽單位主管簽核
        $('#countersign_leader').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('countersign_leader')
            } else {
                Tool.add_person('countersign_leader')
            }
        })

        //會簽單位主管不需簽核
        $('#countersign_leader_skip').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('countersign_leader_skip')
            } else {
                Tool.add_person('countersign_leader_skip')
            }
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
            reverse_desc += `${reason}(${supervisor})(${time_record})<br>`
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

        //副總經理不需簽核
        $('#vicegm_skip').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('vicegm_skip')
            } else {
                Tool.add_person('vicegm_skip')
            }
        })

        //副總經理取消簽核
        $('#vicegm_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${vicegm})(${time_record})<br>`
            Tool.reverse('vicegm')
            // }
        })

        //總經理簽核
        $('#gm').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('gm')
            } else {
                Tool.add_person('gm')
            }
        })

        //總經理取消簽核
        $('#gm_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${gm})(${time_record})<br>`
            Tool.reverse('gm')
            // }
        })

        //總經理不需簽核
        $('#gm_skip').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('gm_skip')
            } else {
                Tool.add_person('gm_skip')
            }
        })

        //審核人員簽核
        $('#reviewer').on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('reviewer')
            } else {
                Tool.add_person('reviewer')
            }
        })

        //審格人員取消簽核
        $('#reviewer_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${reviewer})(${time_record})<br>`
            Tool.reverse('reviewer')
            // }
        })

        //承辦人員簽核，簽核時同時將簽核狀況寫入資料庫，若簽核時執行狀況為空值，則警示需完成填寫
        $('#executor').on('click', function () {
            if ($('#executor_desc').val() == '') {
                alert('請完成執行狀況填寫')
            } else {
                //檢查是否有第1次簽核記錄，並進行簽核，同時將執行狀況加入更新
                $('#signoff_executor_desc').val($('#executor_desc').val())
                if (check_verification == '1') {
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

        //承辦人員取消簽核
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
            reverse_desc += `${reason}(${executor})(${time_record})<br>`
            Tool.reverse('executor')
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
            // else {
            reverse_desc += `${reason}(${executor_leader})(${time_record})<br>`
            Tool.reverse('executor_leader')
            // }
        })

        //會辦單位覆核，簽核時同時將簽核狀況寫入資料庫，若簽核時覆核意見為空值，則警示需完成填寫
        $('#countersign_review').on('click', function () {
            if ($('#countersign_review_desc').val() == '') {
                alert('請完成覆核意見填寫')
            } else {
                //檢查是否有第1次簽核記錄，並進行簽核，同時將執行狀況加入更新
                $('#signoff_countersign_review_desc').val($('#countersign_review_desc').val())
                if (check_verification == '1') {
                    // 防止連點
                    let that = $(this);
                    $(that).attr('disabled', true);
                    setTimeout(function () {
                        $(that).attr('disabled', false);
                    }, 3000);
                    Tool.direct('countersign_review')
                } else {
                    Tool.add_person('countersign_review')
                }
            }
        })

        //會辦單位取消簽核
        $('#countersign_review_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${countersign_review})(${time_record})<br>`
            Tool.reverse('countersign_review')
            // }
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
            reverse_desc += `${reason}(${executor_supervisor})(${time_record})<br>`
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
                'PrintContent/Info?PostData=' +
                Basic._webBaseEncode('SysData=' + id.join(',')), "_blank")
        })

        $('#print').on('click', function () {
            window.open(
                window._JS_BASEURL +
                'PrintContent/Info?PostData=' +
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
                url: window._JS_BASEURL + 'Info_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid)
                },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功')
                        location.href = window._JS_BASEURL + 'Info'
                    } else {
                        alert(callback.message)
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後在嘗試。')
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
        // console.log(id)
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
            url: window._JS_BASEURL + 'Info_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                // console.log(callback)
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
                            window._JS_BASEURL + 'Info/edit?PostData=' + callback.result
                    }
                } else {
                    alert(callback)
                    // alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後在嘗試。')
            },
        })
    },
    //快速新增表單
    direct_ins: function direct_ins() {
        var loginForm = $('#form-main').serializeArray()
        // var send_data_ = new FormData($('#form-main')[0])

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Info_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                // console.log(callback)
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
                            window._JS_BASEURL + 'Info/edit?PostData=' + callback.result
                    }
                } else {
                    alert("請重新登入")
                    location.href =
                        window._JS_BASEURL + 'Info'
                    // alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後在嘗試。')
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
            url: window._JS_BASEURL + '/Info_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
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
                                window._JS_BASEURL + 'Info?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Info/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                            // location.href = window._JS_BASEURL + 'Info'
                        }
                    }
                } else {
                    // console.log(callback)
                    alert(callback.message)
                    // return
                    location.href =
                        window._JS_BASEURL +
                        'Info/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                    // location.href = window._JS_BASEURL
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後在嘗試。')
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

        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Info_ajax/sign_off_reverse',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                // console.log(callback)
                if (callback.status === 'SUCCESS') {
                    alert('取消成功')
                    if (
                        callback.result.check_sign == '1' &&
                        callback.result.SysData != null
                    ) {
                        location.href =
                            window._JS_BASEURL + 'Info?PostData=' + callback.result.SysData
                    } else {
                        location.href =
                            window._JS_BASEURL +
                            'Info/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                        // location.href = window._JS_BASEURL + 'Info'
                    }
                } else {
                    // console.log(callback)
                    alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // console.log(thrownError,xhr,ajaxOptions)
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
        loginForm[5] = { name: 'title', value: title }
        loginForm[6] = { name: 'creator', value: creator }
        loginForm[7] = { name: 'check_sign', value: check_sign }
        loginForm[8] = { name: 'dept', value: dept }
        if (Name == 'vicegm' || Name == 'gm') {
            loginForm[9] = { name: 'jobtitle', value: Jobtitle }
        }

        var signOffForm = $('#form-main').serializeArray()
        var InfoData = signOffForm.concat(loginForm)
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Info_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
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
                                window._JS_BASEURL + 'Info?PostData=' + callback.result.SysData
                        } else {
                            location.href =
                                window._JS_BASEURL +
                                'Info/edit?PostData=' +
                                Basic.getUrlVars()['PostData'] +
                                '&check_sign=' +
                                Basic.getUrlVars()['check_sign']
                            // location.href = window._JS_BASEURL + 'Info'
                        }
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Info/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                    // location.href = window._JS_BASEURL 
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // console.log(thrownError,xhr,ajaxOptions)
                alert('網路可能不夠順暢，請稍後在嘗試。')
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


/*表單於單位主管簽核前可更改，或單號取消時亦可由本人修改*/
if ((process <= 1 && Dpt == dept) || (creator === login_id && enabled === '0')) {
    $("#edit").removeClass("d-none")
    $('input').removeAttr('readonly')
    $('textarea').removeAttr('readonly')
    $('input').removeAttr('onclick')
    $('#executor_desc').prop('readonly', true)
    $('#countersign_review_desc').prop('readonly', true)

    //各相關checkbox選取/取消選取時會移除欄位唯讀/清除相關內容
    $('#account').on('click', function () {
        if ($('#account').is(':checked')) {
            $('.account_name').prop('readonly', false)
            $('#account').prop('checked', true)
            $('#account').val(1)
            $('.account_name').focus()
        } else {
            $('.account_name').val('')
            $('.account_name').prop('readonly', true)
            $('#account').prop('checked', false)
            $('#account').val(0)
        }
    })

    $('#email_group').on('click', function () {
        if ($('#email_group').is(':checked')) {
            $('.email_group_name').prop('readonly', false)
            $('#email_group').prop('checked', true)
            $('#email_group').val(1)
            $('.email_group_name').focus()
        } else {
            $('.email_group_name').val('')
            $('.email_group_name').prop('readonly', true)
            $('#email_group').prop('checked', false)
            $('#email_group').val(0)
        }
    })

    $('#nas').on('click', function () {
        if ($('#nas').is(':checked')) {
            $('.nas_desc').prop('readonly', false)
            $('#nas').prop('check', true)
            $('#nas').val(1)
            $('#nas_desc').focus()
        } else {
            $('.nas_desc').val('')
            $('.nas_desc').prop('readonly', true)
            $('#nas').prop('check', false)
            $('#nas').val(0)
        }
    })

    $('#software').on('click', function () {
        if ($('#software').is(':checked')) {
            $('.software').prop('readonly', false)
            $('#software').prop('check', true)
            $('#software').val(1)
            $('#software_name').focus()
        } else {
            $('.software').val('')
            $('.software').prop('readonly', true)
            $('#software').prop('check', false)
            $('#software').val(0)
        }
    })

    $('#hardware').on('click', function () {
        if ($('#hardware').is(':checked')) {
            $('.hardware').prop('readonly', false)
            $('#hardware').prop('check', true)
            $('#hardware').val(1)
            $('#hardware_desc').focus()
        } else {
            $('.hardware').val('')
            $('.hardware').prop('readonly', true)
            $('#hardware').prop('check', false)
            $('#hardware').val(0)
        }
    })

    $('#direct_line').on('click', function () {
        if ($('#direct_line').is(':checked')) {
            $('.direct_line').prop('readonly', false)
            $('#direct_line').prop('check', true)
            $('#direct_line').val(1)
            $('#direct_line_desc').focus()
        } else {
            $('.direct_line').val('')
            $('.direct_line').prop('readonly', true)
            $('#direct_line').prop('check', false)
            $('#direct_line').val(0)
        }
    })

    $('#bandwidth').on('click', function () {
        if ($('#bandwidth').is(':checked')) {
            $('.bandwidth').prop('readonly', false)
            $('#bandwidth').prop('check', true)
            $('#bandwidth').val(1)
            $('#bandwidth_desc').focus()
        } else {
            $('.bandwidth').val('')
            $('.bandwidth').prop('readonly', true)
            $('#bandwidth').prop('check', false)
            $('#bandwidth').val(0)
        }
    })

    $('#other').on('click', function () {
        if ($('#other').is(':checked')) {
            $('.other').prop('readonly', false)
            $('#other').prop('check', true)
            $('#other').val(1)
            $('#other_desc').focus()
        } else {
            $('.other').val('')
            $('.other').prop('readonly', true)
            $('#other').prop('check', false)
            $('#other').val(0)
        }
    })

    // 輸入欄位點擊時，會取消該欄位之唯讀並將該欄位改為已選取
    $('.account_name').on('click', function () {
        if ($('#account').not(':checked')) {
            $('.account_name').prop('readonly', false)
            $('#account').prop('checked', true)
            $('#account').val(1)
        }
    })

    $('.email_group_name').on('click', function () {
        if ($('#email_group').not(':checked')) {
            $('.email_group_name').prop('readonly', false)
            $('#email_group').prop('checked', true)
            $('#email_group').val(1)
        }
    })

    $('#nas_desc').on('click', function () {
        if ($('#nas').not(':checked')) {
            $('.nas_desc').prop('readonly', false)
            $('#nas').prop('checked', true)
            $('#nas').val(1)
        }
    })

    $('#software_name').on('click', function () {
        if ($('#software').not(':checked')) {
            $('.software').prop('readonly', false)
            $('#software').prop('checked', true)
            $('#software').val(1)
        }
    })

    $('#software_desc').on('click', function () {
        if ($('#software').not(':checked')) {
            $('.software').prop('readonly', false)
            $('#software').prop('checked', true)
            $('#software').val(1)
        }
    })

    $('#hardware_desc').on('click', function () {
        if ($('#hardware').not(':checked')) {
            $('.hardware').prop('readonly', false)
            $('#hardware').prop('checked', true)
            $('#hardware').val(1)
        }
    })

    $('#direct_line_desc').on('click', function () {
        if ($('#direct_line').not(':checked')) {
            $('.direct_line').prop('readonly', false)
            $('#direct_line').prop('checked', true)
            $('#direct_line').val(1)
        }
    })

    $('#bandwidth_desc').on('click', function () {
        if ($('#bandwidth').not(':checked')) {
            $('.bandwidth').prop('readonly', false)
            $('#bandwidth').prop('checked', true)
            $('#bandwidth').val(1)
        }
    })

    $('#other_desc').on('click', function () {
        if ($('#other').not(':checked')) {
            $('.other').prop('readonly', false)
            $('#other').prop('checked', true)
            $('#other').val(1)
        }
    })

    //若輸入為空值，則將選項之check狀態取消
    $('.account_name').focusout(function () {
        if (this.value === '') {
            $('#account').prop('checked', false)
            $('#account').val(0)
        }
    })

    $('.email_group_name').focusout(function () {
        if (this.value === '') {
            $('#email_group').prop('checked', false)
            $('#email_group').val(0)
        }
    })

    $('#nas_desc').focusout(function () {
        if (this.value === '') {
            $('#nas').prop('checked', false)
            $('#nas').val(0)
        }
    })

    $('.software').focusout(function () {
        if ($('#software_name').val() === '' && $('#software_desc').val() === '') {
            $('#software').prop('checked', false)
            $('#software').val(0)
        }
    })

    $('#hardware_desc').focusout(function () {
        if (this.value === '') {
            $('#hardware').prop('checked', false)
            $('#hardware').val(0)
        }
    })

    $('#direct_line_desc').focusout(function () {
        if (this.value === '') {
            $('#direct_line').prop('checked', false)
            $('#direct_line').val(0)
        }
    })

    $('#bandwidth_desc').focusout(function () {
        if (this.value === '') {
            $('#bandwidth').prop('checked', false)
            $('#bandwidth').val(0)
        }
    })

    $('#other_desc').focusout(function () {
        if (this.value === '') {
            $('#other').prop('checked', false)
            $('#other').val(0)
        }
    })

} else {
    $('#related_name').addClass('d-none')
}

//複選框點擊事件
function GetIds() {
    //獲取所有複選框
    $("input:checkbox[name='checklist']").each(function () {
        var v = $(this).val()
        //console.log(v);

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

//相關附件選項
// 編輯頁面之x-data
let dataEdit = () => {
    return {
        file: file,
        file_name: file_name,
        is_enabled: enabled,
        check_file(value) {
            if (this.$refs.newFile.files.length === 1 && value === 0) {
                $('#related_name').wrap('<form>').closest('form').get(0).reset();
                this.file = '0';
            } else if (this.$refs.newFile.files.length === 0 && value === 1) {
                $('#related_name').click();
                $('#related_no').prop('checked', true);
            }
        },
        change_state() {
            if (this.$refs.newFile.files.length === 1) {
                if (this.$refs.newFile.files[0].size > 104857600) {
                    $('#related_no').prop('checked', true)
                    this.file = '0';
                    this.file_name = '';
                    $('#related_name').wrap('<form>').closest('form').get(0).reset();
                    alert('檔案大小超過100MB，請重新選擇');
                    return
                } else {
                    $('#related_yes').prop('checked', true)
                    this.file = '1';
                    this.file_name = this.$refs.newFile.files[0].name;
                }
            } else {
                $('#related_no').prop('checked', true)
                this.file = '0';
                this.file_name = '';
            }
        },
        checkProcess() {
            // 執行狀況及會簽單位覆核為必填欄位
            if ((process === '6' && ['7', '16'].includes(Dpt))) {
                $('#executor_desc').prop('readonly', false)
                $('#executor_desc').addClass("border border-danger")
            }

            if ((process === '8' && ['7', '15'].includes(Dpt))) {
                $('#countersign_review_desc').prop('readonly', false)
                $('#countersign_review_desc').addClass("border border-danger")
            }
        }
    }
}


