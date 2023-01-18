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
                var data_url = '/Demand_api_ajax/get_demand_list'
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
                        console.log(getstatus)
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
                    title: '單號',
                    data: 'dem_order_no',
                },
                {
                    title: '主題',
                    data: 'dem_title',
                },
                {
                    title: '簽核進度',
                    data: 'dem_process',
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
                        if (row.dem_group_id === '4') {
                            return '<span>群心</span>'
                        }
                    },
                },
                {
                    title: '規劃人員',
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return '<span>' + row.mb_user_name + '(' + row.dem_creator + ')</span>'
                    },
                },
                {
                    title: '驗收狀態',
                    render: function (data, type, row, meta) {
                        if (row.dem_verify_status === '0') {
                            return '<span>全數合格</span>'
                        }
                        if (row.dem_verify_status === '1') {
                            return '<span>部份驗收合格</span>'
                        }

                        if (row.dem_verify_status === '2') {
                            return '<span>驗收均不合格</span>'
                        }

                        if (row.dem_verify_status === '') {
                            return '<span>-</span>'
                        }
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
                            'Demand_api/edit?PostData=' +
                            row.dem_sys_id +
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
            e.preventDefault()
            self.postParams = Tool.getFormJsonData($('#form-query'))
            self.table.ajax.reload()
        })
        $('#ins').on('click', function () {
            // $(this).unbind()
            // console.log('ins')
            // return
            var loginForm = $('#form-main').serializeArray()
            var order_no = $('#order_no').val() || null
            var group_id = $('input[name=group_id]:checked').val() || null
            console.log(loginForm)
            // return
            $.ajax({
                type: 'POST',
                url: '/Demand_api_ajax/create_order',
                cache: false,
                data: {
                    send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                },
                success: function (callback, status, xhr) {
                    console.log(callback)
                    // console.log(JSON.parse(callback))
                    // return
                    if (callback.status === 'SUCCESS') {
                        // if(Group!=group_id){
                        //    alert('新增成功,您必須填文件簽核申請表');
                        //    location.href = '/SignOff/create?PostData='+callback.result;
                        //  }else{
                        //     alert('新增成功');
                        //     location.href = '/Demand'
                        //  }
                        alert('新增成功')
                        // return
                        location.href = window._JS_BASEURL + 'Demand_api/edit?PostData=' + callback.result
                        // location.href = '/Demand'
                    } else {
                        // alert(JSON.parse(callback).message)
                        alert(callback.message)
                        // location.href = window._JS_BASEURL
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
            // console.log($("#dev_workhour").val())
            // console.log(process)
            // return
            // var loginForm = $('#form-main').serializeArray()
            var send_data_ = new FormData($('#form-main')[0])
            // console.log($('#form-main')[0])
            // return
            $.ajax({
                type: 'POST',
                url: '/Demand_api_ajax/update_order',
                cache: false,
                processData: false,
                contentType: false,
                data: send_data_,
                // data: {
                //     send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                // },
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    // return
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand_api/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                        // location.href = '/Demand'

                    } else {
                        alert(callback.message)
                        console.log(callback)
                        // return
                        // location.href =
                        //     window._JS_BASEURL +
                        //     'Demand/edit?PostData=' +
                        //     Basic.getUrlVars()['PostData'] +
                        //     '&check_sign=' +
                        //     Basic.getUrlVars()['check_sign']
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍候再嘗試。')
                },
            })
        })

        //更新附件檔案
        //更新
        $('#upload-file').on('click', function () {
            // var loginForm = $('#form-main').serializeArray()
            // console.log(loginForm)
            var send_data_ = new FormData($('#upload_file')[0])
            // console.log($('#upload_file'))
            // return
            $.ajax({
                type: 'POST',
                url: '/Demand_api_ajax/update_order',
                cache: false,
                contentType: false,
                processData: false,
                data: send_data_,
                // data: {
                //     send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                // },
                success: function (callback, status, xhr) {
                    console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand_api/edit?PostData=' +
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

        //驗收人員簽核
        $('#verifier').on('click', function () {
            // if ($("#verify_commet").val().length <= 20) {
            //     alert("請詳細填寫驗收說明")
            //     return
            // }
            // else {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('verifier')
            } else {
                Tool.add_person('verifier')
            }
            // }
        })

        //驗收人員取消簽核
        $('#verifier_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${verifier})(${time_record})<br>`
            Tool.reverse('verifier')
            // }
        })

        //產品規劃部預計驗收單位主管簽核
        $('#pre_leader').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('pre_leader')
            } else {
                Tool.add_person('pre_leader')
            }
        })

        //產品規劃部預計驗收單位主管取消簽核
        $('#pre_leader_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${pre_leader})(${time_record})<br>`
            Tool.reverse('pre_leader')
            // }
        })

        //產品規劃部預計驗收規劃人員簽核
        $('#pre_planner').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('pre_planner')
            } else {
                Tool.add_person('pre_planner')
            }
        })

        //產品規劃部預計驗收規劃人員取消簽核
        $('#pre_planner_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${pre_planner})(${time_record})<br>`
            Tool.reverse('pre_planner')
            // }
        })

        //技術資訊單位部門主管簽核
        $('#dev_director').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('dev_director')
            } else {
                Tool.add_person('dev_director')
            }
        })

        //技術資訊單位部門主管取消簽核
        $('#dev_director_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${dev_director})(${time_record})<br>`
            Tool.reverse('dev_director')
            // }
        })

        //技術資訊單位主管簽核
        $('#dev_leader').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('dev_leader')
            } else {
                Tool.add_person('dev_leader')
            }
        })

        //技術資訊單位主管取消簽核
        $('#dev_leader_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${dev_leader})(${time_record})<br>`
            Tool.reverse('dev_leader')
            // }
        })

        //登入者為研發工程師本人時，顯示簽核按鈕，使其可簽核
        // console.log(Id)
        $("#dem_dev_rd_" + Id).removeClass('d-none')
        $("#dem_dev_rd_" + Id).on('click', function () {
            if ($("#dev_workhour").val() == 0) {
                alert("請填寫預估開發工時")
                return
            } else if ($("#dev_workhour").val() < 0 || $("#dev_workhour").val() >= 1000) {
                alert("預估開發工時請輸入1-999之數值")
                return
            }
            location.href += "&rd=" + $(this).data('rd') + "&dev_estimate=" + $("#dev_estimate").val() + "&dev_workhour=" + $("#dev_workhour").val()
        })

        //研發工程師簽核
        if (typeof rd != "undefined") rd_sign(rd)
        function rd_sign(rd) {
            $("#dev_rd" + rd).val($("#dev_rd_appoint" + rd).val())
            $("#dev_rd_appoint" + rd).val('')
            // return
            // var loginForm = $('#form-main').serializeArray()
            //登入後首次簽核需輸入密碼
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('dev_rd')
            } else {
                Tool.add_person('dev_rd')
            }
        }

        //研發工程師取消簽核
        $("#dem_dev_rd_reverse_" + Id).on('click', function () {
            // console.log('rev')
            // return
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
            reverse_desc += `${reason}(${rd_reverser})(${time_record})<br>`
            location.href += "&rd_reverse=" + $(this).data('rdreverse') + "&reason=" + reverse_desc
        })

        if (typeof rd_reverse != "undefined") rd_sign_reverse(rd_reverse)
        function rd_sign_reverse(rd_reverse) {
            $("#dev_rd_appoint" + rd_reverse).val(Id + '/' + Group)
            $("#dev_rd" + rd_reverse).val('')
            // return
            // var loginForm = $('#form-main').serializeArray()
            //登入後首次簽核需輸入密碼
            Tool.reverse('dev_rd')
        }




        //技術資訊單位收件簽核，須在指定至少一位研發工程師後方可簽核
        //於指定工程師後另行註冊事件
        $('#dev_receive').on('click', function () {
            console.log(appointed_rd.length)
            if (appointed_rd.length == 0) alert('請指定至少一位研發工程師')
        })

        //技術資訊單位收件取消簽核
        $('#dev_receive_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${dev_receive})(${time_record})<br>`
            Tool.reverse('dev_receive')
            // }
        })

        //副總經理簽核
        $('#vicegm').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('vicegm')
                //防止連點
                $(this).unbind()
            } else {
                Tool.add_person('vicegm')
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

        //需求單位部門主管簽核
        $('#director').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('director')
            } else {
                Tool.add_person('director')
            }
        })

        //需求單位部門主管取消簽核
        $('#director_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${director})(${time_record})<br>`
            Tool.reverse('director')
            // }
        })

        //產品規劃單位主管簽核
        $('#plan_leader').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('plan_leader')
            } else {
                Tool.add_person('plan_leader')
            }
        })

        //產品規劃單位主管取消簽核
        $('#plan_leader_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${plan_leader})(${time_record})<br>`
            Tool.reverse('plan_leader')
            // }
        })

        //產品規劃單位人員簽核
        $('#planner').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('planner')
            } else {
                Tool.add_person('planner')
            }
        })

        //產品規劃單位人員取消簽核
        $('#planner_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${planner})(${time_record})<br>`
            Tool.reverse('planner')
            // }
        })

        //需求單位單位主管簽核
        $('#req_leader').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('req_leader')
            } else {
                Tool.add_person('req_leader')
            }
        })

        //需求單位單位主管取消簽核
        $('#req_leader_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${req_leader})(${time_record})<br>`
            Tool.reverse('req_leader')
            // }
        })

        //需求單位需求人員簽核
        $('#requirer').on('click', function () {
            if (check_verification == '1') {
                //防止連點
                $(this).unbind()
                Tool.direct('requirer')
            } else {
                Tool.add_person('requirer')
            }
        })

        //需求單位需求人員取消簽核
        $('#requirer_reverse').on('click', function () {
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
            reverse_desc += `${reason}(${requirer})(${time_record})<br>`
            Tool.reverse('requirer')
            // }
        })

        //文件會簽
        $('#countersign').on('click', function () {
            if (check_verification == '1') {
                Tool.direct('countersign')
            } else {
                Tool.add_person('countersign')
            }
        })

        // $('#dev_rd').on('click', function () {
        //     if (check_verification == '1') {
        //         Tool.direct('dev_rd')
        //     } else {
        //         Tool.add_person('dev_rd')
        //     }
        // })
        // $('#pre_director').on('click', function () {
        //     if (check_verification == '1') {
        //         Tool.direct('pre_director')
        //     } else {
        //         Tool.add_person('pre_director')
        //     }
        // })


        // $('#download').on('click', function () {
        //     var Data = $('#form-query').serialize()
        //     location.href =
        //         '/PrintContent/Demand?PostData=' + Tool._webBaseEncode(Data)
        // })
        //列印
        $('#download').on('click', function () {
            // return
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            }

            location.href =
                window._JS_BASEURL +
                'PrintContent/Demand_api?PostData=' +
                Basic._webBaseEncode('SysData=' + id.join(','))
        })

        //單號取消
        $('#cancel').on('click', function () {
            // console.log(id)
            // return
            if (id.length == 0) {
                alert('未勾選項目')
                return false
            } else {
                var sysid = 'SysData=' + id.join(',')
            }

            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Demand_api_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid),
                },
                success: function (callback, status, xhr) {
                    console.log(callback)
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功')
                        location.href = window._JS_BASEURL + 'Demand_api'
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

        //設定部份驗收合格時，輸入數量框之顯示
        $("#verify_status_1").change(function () {
            if (this.checked == true) {
                $("#verify_status_num").removeClass("d-none")
            } else {
                $("#verify_status_num").addClass("d-none")
            }
        })
        $("#verify_status_0").change(function () {
            if (this.checked == true) {
                $("#verify_status_num").addClass("d-none")
            }
        })
        $("#verify_status_2").change(function () {
            if (this.checked == true) {
                $("#verify_status_num").addClass("d-none")
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
        console.log(id)
    },
    add_person: function add_person(Name) {
        // console.log('add_person')
        // return
        $(this).removeData('modal')
        save_method = 'add'
        $('#form')[0].reset() // reset form on modals
        $('.form-group').removeClass('has-error') // clear error class
        $('.help-block').empty() // clear errorF string
        $('#modal_form').modal('show') // show bootstrap modal
        TableName = Name
    },

    //簽名驗證
    save: function save() {
        // console.log('save')
        // return
        var isclick = true
        var pw = $('#pw').val() || null
        var SysId = $('#sys_id').val() || null
        if (pw === null) {
            alert('請輸入密碼')
            return false
        }

        var signOffForm = $('#form').serializeArray()
        var loginForm = $('#form-main').serializeArray()

        loginForm.push({
            name: 'signoff',
            value: TableName,
        })
        var InfoData = signOffForm.concat(loginForm)
        console.log(InfoData)
        // return
        $.ajax({
            type: 'POST',
            url: '/Demand_api_ajax/sign_off',
            cache: false,
            data: {
                // send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                console.log(callback)
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
                            '/SignOff/create?PostData=' + callback.result.PostData
                    } else {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand_api/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                        // location.href = '/Demand'
                    }
                } else {
                    // console.log(callback)
                    alert(callback.message)
                    // return
                    location.href =
                        window._JS_BASEURL +
                        'Demand_api/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // console.log(thrownError);
                // return
                alert('網路可能不夠順暢，請稍候再嘗試。')
            },
        })
    },
    //簽核取消
    reverse: function reverse(Name) {
        // var loginForm = []
        // loginForm[0] = { name: 'signoff', value: Name }
        // loginForm[1] = { name: 'sys_id', value: sys_id }
        // loginForm[2] = { name: 'reverse', value: reverse_desc }
        // loginForm[3] = { name: 'process', value: process }

        var signOffForm = $('#form').serializeArray()
        var loginForm = $('#form-main').serializeArray()
        loginForm.push({
            name: 'signoff',
            value: Name,
        })
        loginForm.push({
            name: 'reverse',
            value: reverse_desc,
        })
        var InfoData = signOffForm.concat(loginForm)
        // loginForm[4] = { name: 'pre_receive', value: pre_receive }

        // var send_data_ = new FormData(loginForm)

        // console.log(loginForm)
        // return
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Demand_api_ajax/sign_off_reverse',
            cache: false,
            // processData: false,
            // contentType: false,
            // data: send_data_,
            data: {
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                // console.log(callback)
                // return
                if (callback.status === 'SUCCESS') {
                    alert('取消成功')
                    if (
                        callback.result.check_sign == '1' &&
                        callback.result.SysData != null
                    ) {
                        location.href =
                            window._JS_BASEURL + 'Demand_api?PostData=' + callback.result.SysData
                    } else {
                        location.href =
                            window._JS_BASEURL +
                            'Demand_api/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                        // location.href = window._JS_BASEURL + 'Info'
                    }
                } else {
                    console.log(callback)
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
        // console.log('direct')
        // return
        var loginForm = []
        loginForm[0] = { name: 'signoff', value: Name }
        loginForm[1] = { name: 'sys_id', value: sys_id }
        loginForm[2] = { name: 'group_id', value: group_id }
        loginForm[3] = { name: 'process', value: process }
        loginForm[4] = { name: 'order_no', value: order_no }
        loginForm[5] = { name: 'title', value: title }
        loginForm[6] = { name: 'requirer', value: requirer }
        var signOffForm = $('#form-main').serializeArray()
        var InfoData = loginForm.concat(signOffForm)
        console.log(InfoData)
        // return
        $.ajax({
            type: 'POST',
            url: '/Demand_api_ajax/sign_off',
            cache: false,
            data: {
                // send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
                send_data_: Tool._webBaseEncode(jQuery.param(InfoData)),
            },
            success: function (callback, status, xhr) {
                console.log(callback)
                if (callback.status === 'SUCCESS') {
                    if (
                        callback.result.flag === true &&
                        callback.result.is_enable === true
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href = window._JS_BASEURL + 'SignOff/edit?PostData=' + callback.result.sys_id + '&date_status=1';
                    } else if (
                        callback.result.flag === true &&
                        callback.result.is_enable === false
                    ) {
                        alert('更新成功,需填寫文件簽核申請')
                        location.href = window._JS_BASEURL + 'SignOff/create?PostData=' + callback.result.PostData;
                    } else {
                        alert('更新成功')
                        location.href =
                            window._JS_BASEURL +
                            'Demand_api/edit?PostData=' +
                            Basic.getUrlVars()['PostData'] +
                            '&check_sign=' +
                            Basic.getUrlVars()['check_sign']
                        // location.href = '/Demand'
                    }
                } else {
                    alert(callback.message)
                    location.href =
                        window._JS_BASEURL +
                        'Demand_api/edit?PostData=' +
                        Basic.getUrlVars()['PostData'] +
                        '&check_sign=' +
                        Basic.getUrlVars()['check_sign']
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                // return
                alert('網路可能不夠順暢，請稍後在嘗試。')
            },
        })
    },
}

jQuery(document).ready(function () {
    Page.init()
    var TableName = ''
})


//相關附件選項
$('#related_name').change(function () {
    // console.log($('#related_name').get(0).files)
    if (!$('#related_name').get(0).files[0]) {
        $('#related_no').trigger('click')
    } else {
        $('#related_yes').prop('checked', true)
    }
})

$('#related_yes').on('click', function () {
    $('#related_exists').addClass('d-none')
    $('#related_query').removeClass('d-none')
    $('#related_no').removeAttr('checked')
    $('#related_name').trigger('click')
})

$('#related_yes').focusout(function () {
    if (!$('#related_name').get(0).files[0]) {
        $('#related_no').prop('checked', true)
    }
})

$('#related_no').on('click', function () {
    $('#related_exists').addClass('d-none')
    $('#related_query').removeClass('d-none')
    $('#related_name').wrap('<form></form>')
    $('#related_name').parent()[0].reset()
    $('#related_name').unwrap()
})

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

//版本模式相關點擊行為
$('#ezpay_version_type_1').on('click', function () {
    if ($('#ezpay_version_type_1').is(':checked')) {
        $('#ezpay_version_type_1').prop('check', true)
        $('#ezpay_user').val('')
    } else {
        $('#ezpay_version_type_1').prop('check', false)
        // $('#ezpay_user').focus()
    }
})
$('#ezpay_version_type_2').on('click', function () {
    if ($('#ezpay_version_type_1').is(':checked')) {
        $('#ezpay_version_type_1').prop('check', true)
        $('#ezpay_user').focus()
    } else {
        $('#ezpay_version_type_1').prop('check', false)
        $('#ezpay_user').val('')
    }
})
$('#ezpay_user').on('click', function () {
    if ($('#ezpay_version_type_2').not(':checked')) {
        $('#ezpay_version_type_1').prop('checked', false)
        $('#ezpay_version_type_2').prop('checked', true)
        console.log($('#ezpay_version_type_2').val())
    }
})

$('#nwp_version_type_1').on('click', function () {
    if ($('#nwp_version_type_1').is(':checked')) {
        $('#nwp_version_type_1').prop('check', true)
        $('#nwp_user').val('')
    } else {
        $('#nwp_version_type_1').prop('check', false)
        // $('#nwp_user').focus()
    }
})
$('#nwp_version_type_2').on('click', function () {
    if ($('#nwp_version_type_1').is(':checked')) {
        $('#nwp_version_type_1').prop('check', true)
        $('#nwp_user').focus()
    } else {
        $('#nwp_version_type_1').prop('check', false)
        $('#nwp_user').val('')
    }
})
$('#nwp_user').on('click', function () {
    if ($('#nwp_version_type_2').not(':checked')) {
        $('#nwp_version_type_1').prop('checked', false)
        $('#nwp_version_type_2').prop('checked', true)
        console.log($('#nwp_version_type_2').val())
    }
})
// $('#nwp_user').focusout(function () {
    // if ($('#nwp_user').val() === '' || $('#nwp_user').val() === '0') {
        // $('#nwp_version_type_2').prop('checked', false)
    //     $('#nwp_user').val('')
    // }
// })


//商店約定IP相關點擊設定(IP最多設定99組)
$('#ip_1').on('click', function () {
    if ($('#ip_1').is(':checked')) {
        $('#ip_1').prop('check', true)
        $('#ezpay_ip').focus()
    } else {
        $('#ezpay_ip').val('')
        $('#ip_1').prop('check', false)
        $('#ip_1').val(2)
    }
})
$('#ip_2').on('click', function () {
    if ($('#ip_2').is(':checked')) {
        $('#ezpay_ip').val('')
    }
})

$('#ezpay_ip').on('click', function () {
    if ($('#ip_1').not(':checked')) {
        $('#ip_1').prop('checked', true)
        $('#ip_2').prop('checked', false)
    }
})

$('#ezpay_ip').focusout(function () {
    if ($('#ezpay_ip').val() === '' || $('#ezpay_ip').val() === '0') {
        $('#ip_1').prop('checked', false)
        $('#ezpay_ip').val('')
    }else if($('#ezpay_ip').val()<0 ||$('#ezpay_ip').val() >99){
        alert('請輸入0-99之數值')
        $('#ezpay_ip').val('')
        $('#ip_1').prop('checked', false)
    }
})

$('#nwp_ip_1').on('click', function () {
    if ($('#nwp_ip_1').is(':checked')) {
        $('#nwp_ip_1').prop('check', true)
        $('#nwp_ip_num').focus()
    } else {
        $('#nwp_ip_num').val('')
        $('#nwp_ip_1').prop('check', false)
        $('#nwp_ip_1').val(2)
    }
})
$('#nwp_ip_2').on('click', function () {
    if ($('#nwp_ip_2').is(':checked')) {
        $('#nwp_ip_num').val('')
    }
})

$('#nwp_ip_num').on('click', function () {
    if ($('#nwp_ip_1').not(':checked')) {
        $('#nwp_ip_1').prop('checked', true)
        $('#nwp_ip_2').prop('checked', false)
    }
})

$('#nwp_ip_num').focusout(function () {
    if ($('#nwp_ip_num').val() === '' || $('#nwp_ip_num').val() === '0') {
        $('#nwp_ip_1').prop('checked', false)
        $('#nwp_ip_num').val('')
    }else if($('#nwp_ip_num').val()<0 ||$('#nwp_ip_num').val() >99){
        alert('請輸入0-99之數值')
        $('#nwp_ip_num').val('')
        $('#nwp_ip_1').prop('checked', false)
    }
})

$('#wcp_ip_1').on('click', function () {
    if ($('#wcp_ip_1').is(':checked')) {
        $('#wcp_ip_1').prop('check', true)
        $('#wcp_ip').focus()
    } else {
        $('#wcp_ip').val('')
        $('#wcp_ip_1').prop('check', false)
        $('#wcp_ip_1').val(2)
    }
})
$('#wcp_ip_2').on('click', function () {
    if ($('#wcp_ip_2').is(':checked')) {
        $('#wcp_ip').val('')
    }
})

$('#wcp_ip').on('click', function () {
    if ($('#wcp_ip_1').not(':checked')) {
        $('#wcp_ip_1').prop('checked', true)
        $('#wcp_ip_2').prop('checked', false)
    }
})

$('#wcp_ip').focusout(function () {
    if ($('#wcp_ip').val() === '' || $('#wcp_ip').val() === '0') {
        $('#wcp_ip_1').prop('checked', false)
        $('#wcp_ip').val('')
    }else if($('#wcp_ip').val()<0 ||$('#wcp_ip').val() >99){
        alert('請輸入0-99之數值')
        $('#wcp_ip').val('')
        $('#wcp_ip_1').prop('checked', false)
    }
})

// 指定研發工程師
let appointed_rd = []
let appointed_count = 0
let rds_selection
$('#appoint_rd').click(function () {
    rds_selection = []
    // console.log($(this))
    // console.log(appointed_rd)
    rds.forEach(function (value) {
        // console.log($.inArray(value.mb_staff_id,appointed_rd))
        if ($?.inArray(value.mb_staff_id, appointed_rd) == '-1') {
            // console.log(value.mb_staff_id)
            rds_selection += `
                    <option value="${value.mb_staff_id}/${value.mb_group}" data-staffid="${value.mb_staff_id}">${value.mb_user_name}</option>
                    `
        }
    })
    // console.log(rds_selection.length)
    $('#appoint_rd').before(
        `
    <select class="rd-select">
    <option>名單</option>
    ${rds_selection}
    </select>
    `
    )


    $('.rd-select').focus()
    // console.log($('.rd-select')[0].options)
    $('.rd-select')[0].size = $('.rd-select')[0].options.length
    $('.rd-select').change(function () {
        //選定後，將選定人員加入欄位，並將原選單移除，並變更預估開發人力數值
        // console.log($("option:selected",this).data("staffid"))
        // return
        appointed_rd.push($("option:selected", this).data("staffid"))
        $('#appoint_rd').before(
            `
            <span class="badge badge-danger border-rounded" id="rd_cancel${appointed_count}" data-staffid="${$("option:selected", this).data("staffid")}" data-value="${$(this).val()}">${$('option:selected', this).text()}</span>
            `
        )
        $('#dev_rd_appoint' + appointed_count).val($(this).val())
        $('#dev_rd_appoint' + appointed_count).data('value', $(this).val())
        $('#dev_rd_appoint' + appointed_count).data('staffid', $(this).data('staffid'))
        $('#dev_cost').val(Number($('#dev_cost').val()) + 1)

        //已選定人員可點擊取消
        $("#rd_cancel" + appointed_count).click(function () {
            appointed_rd.splice(appointed_rd.indexOf($(this).data('staffid')), 1)
            $(`[value=${$(this).data('staffid')}]`).val('')
            // return
            appointed_count--
            $('#dev_cost').val(Number($('#dev_cost').val()) - 1)

            //少於5人時再把指定按鈕放回
            if (appointed_count < 5) $('#appoint_rd').show()
            $(this).remove()
        })
        $(this).remove()

        //選擇人數達5人時，移除選擇按鈕
        appointed_count++
        // console.log(appointed_count)
        if (appointed_count >= 5) $('#appoint_rd').hide()

        // var loginForm = $('#form-main').serializeArray()

        // $.ajax({
        //     type: 'POST',
        //     url: '/Deploy_ajax/update_order',
        //     cache: false,
        //     data: {
        //         send_data_: Tool._webBaseEncode(jQuery.param(loginForm)),
        //     },
        //     success: function (callback, status, xhr) {
        //         // console.log(callback);
        //         if (callback.status === 'SUCCESS') {
        //             alert('更新成功')
        //             location.href =
        //                 window._JS_BASEURL +
        //                 'Deploy/edit?PostData=' +
        //                 Basic.getUrlVars()['PostData'] +
        //                 '&check_sign=' +
        //                 Basic.getUrlVars()['check_sign']
        //         } else {
        //             alert('更新失敗')
        //         }
        //     },
        //     error: function (xhr, ajaxOptions, thrownError) {
        //         console.log(callback)
        //         alert('網路可能不夠順暢，請稍後再嘗試。')
        //     },
        // })

        //註銷原註冊收件事件
        $('#dev_receive').unbind('click')

        //重新註冊事件
        //技術資訊單位收件簽核，簽核時同時將指定研發工程師，若空值，則警示需指定至少一位
        $('#dev_receive').on('click', function () {
            if (appointed_rd.length == 0) {
                alert('請指定至少一位研發工程師')
            } else {
                //檢查是否有第1次簽核記錄，並進行簽核
                if (check_verification == '1') {
                    //防止連點
                    $(this).unbind()
                    Tool.direct('dev_receive')
                } else {
                    Tool.add_person('dev_receive')
                }
            }
        })
    })

    $('.rd-select').blur(function () {
        $('.rd-select').remove()
    })

})



