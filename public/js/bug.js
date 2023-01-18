var Page = {
    init: function init() {
        this.table = this.initTable();
        this.handleEvents();


    },
    initTable: function initTable() {
        var self = this;
        var check_sign = 0;
        return $('.js-exportable').DataTable({
            dom: 'rtip',
            processing: true,
            serverSide: true, //啟動服務器分頁
            searching: false,
            pageLength: 15,
            "columnDefs": [
                { "width": "28%", "targets": 2 },
                { "orderable": false, "targets": [2, 3, 4, 5, 6, 7, 9] },
            ],
            scrollY: 600,
            scrollCollapse: true,
            sPaginationType: "full_numbers",
            bSort: true,
            aaSorting: [
                [8, "desc"]
            ],
            ajax: function (data, callback, settings) {
                var data_url = window._JS_BASEURL + 'Bug_ajax/get_bug_list';
                var searchData = getFormJson('form_z_a', 'typename', 'typevalue');

                //FORM表單值
                function getFormJson(idF, idS, idI) {
                    var select_page = $('#lid :selected').data("kind");
                    var searchData = {};
                    searchData.column = data.order[0].column;
                    searchData.dir = data.order[0].dir;
                    searchData.pageSize = data.length; //每頁的總數量   
                    searchData.pageIndex = data.start; //頁碼
                    //取得form表單資訊
                    var loginForm = $('#form-query').serializeArray();

                    loginForm.push({
                        name: 'PostData',
                        value: Basic.getUrlVars()['PostData']
                    })

                    if (Basic.getUrlVars()['PostData'] != null) {
                        check_sign = 1;
                    }


                    $.each(loginForm, function (i, v) {
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
                    success: function (getstatus, status, xhr) {
                        var returnData = {};
                        if (getstatus.status == 'SUCCESS') {

                            returnData.draw = data.draw;
                            returnData.recordsTotal = getstatus.result.recordsTotal;
                            returnData.recordsFiltered = getstatus.result.recordsTotal;
                            returnData.data = getstatus.result.data; //返回的数据列表
                            $('#download').show();
                            $('#cancel').show();

                        } else {
                            returnData.draw = data.draw;
                            returnData.recordsTotal = 0;
                            returnData.recordsFiltered = 0;
                            returnData.data = []; //返回的数据列表
                            $('#download').hide();
                            $('#cancel').hide();
                        }

                        callback(returnData);


                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert("網路可能不夠順暢，請稍後在嘗試。");
                    }
                });
            },



            columns: [

                {
                    title: '選擇', className: 'text-center', 'orderable': false, render: function (data, type, row, meta) {
                        return '<div class="custom-control custom-checkbox"><input type="checkbox" class="custom-control-input" name="checklist" value="' + row.de_sys_id + '" id="' + row.de_sys_id + '"  onclick="GetIds();"><label style="margin-bottom:5px" class="custom-control-label" for="' + row.de_sys_id + '"></label></div>';

                    }

                }, {
                    title: '單號',
                    data: 'de_order_no'
                }, {
                    title: '主題',
                    data: 'de_title',
                    orderable: false

                }, {
                    title: '研發工程師', orderable: false, render: function (data, type, row, meta) {
                        return "<span>" + row.mb_eng_name + "(" + row.de_creator + ")</span>";

                    }
                }, {
                    title: '簽核進度',
                    data: "de_process",
                    orderable: false

                }, {
                    title: '開立群組', orderable: false, render: function (data, type, row, meta) {

                        if (row.de_group_id === '1') {
                            return "<span>簡單</span>";
                        }
                        if (row.de_group_id === '2') {
                            return "<span>藍新</span>";
                        }

                        if (row.de_group_id === '3') {
                            return "<span>威肯</span>";
                        }
                    }
                }, {
                    title: '平台項目', orderable: false, render: function (data, type, row, meta) {
                        return row.de_platform;
                    }
                }, {
                    title: '驗收狀態', orderable: false, render: function (data, type, row, meta) {

                        if (row.de_verify_status === '') {
                            return "<span>-</span>";
                        }

                        if (row.de_verify_status === '0') {
                            return "<span>驗收不合格</span>";
                        }
                        if (row.de_verify_status === '1') {
                            return "<span>驗收合格</span>";
                        }

                    }
                }, {
                    title: '建立日期',
                    data: 'de_create_time'
                }, {
                    title: '詳細資料', orderable: false,

                    render: function (data, type, row, meta) {
                        return '<a class="btn btn-sm btn-secondary" href="' + window._JS_BASEURL + 'Bug/edit?PostData=' + row.de_sys_id + '&check_sign=' + check_sign + '"><i class="fa fa-list-alt"></i> 詳細資料</a>';
                    }
                }],


            fnDrawCallback: function () {

                $("[name='checklist']").each(function () {
                    var v = $(this).val();
                    if ($.inArray(v, id) > -1) {
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
            maxDate: "",
            onChange: function (selected, dt, inst) {
                var startDate = $("#date_start").val();
                var endDate = $("#date_end").val();
                //截止日大於起始日
                if (startDate !== '' && (inst.element.id === 'date_end' && dt < startDate)) {
                    $("#date_end").val(startDate);
                    $("#date_start").val(dt);

                }
                //起始日小截止日
                if (endDate !== '' && (inst.element.id === 'date_start' && dt > endDate)) {
                    $("#date_end").val(dt);
                    $("#date_start").val(endDate);
                }
            }
        });
        // 重設查詢
        $('#btnResetForm').on('click', function () {
            self.postParams = {};
            self.table.ajax.reload();
        });
        // 送出查詢
        $('#ajaxSubmitQuery').on('click', function (e) {
            e.preventDefault();
            self.postParams = Basic.getFormJsonData($('#form-query'));
            self.table.ajax.reload();
        });
        //更新
        $("#upt").on('click', function () {

            var loginForm = $('#form-main').serializeArray();
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Bug_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + Basic.getUrlVars()['PostData'] + '&check_sign=' + Basic.getUrlVars()['check_sign'];
                    } else {
                        alert('更新失敗');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
        //上版日期調整
        $('.deploy_time').change(function () {
            // console.log($(this).val());
            $('.deploy_time').val($(this).val());
        })
        $('#adjust_data').on('click', function () {
            $('#upt').click()
        })

        $("#rd_approve").on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct_ins('rd_approve');
            } else {
                Basic.add_person('rd_approve');

            }
        });
        $("#director_approve").on('click', function () {

            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('director_approve');
            } else {
                Basic.add_person('director_approve');

            }
        });
        $("#leader_approve").on('click', function () {

            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('leader_approve');
            } else {
                Basic.add_person('leader_approve');

            }

        });
        $("#director_accept").on('click', function () {

            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('director_accept');
            } else {
                Basic.add_person('director_accept');

            }
        });
        $("#leader_accept").on('click', function () {

            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('leader_accept');
            } else {
                Basic.add_person('leader_accept');

            }
        });
        $("#review_rd_accept").on('click', function () {
            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('review_rd_accept');
            } else {
                Basic.add_person('review_rd_accept');

            }
        });
        $("#rd_accept").on('click', function () {

            if (check_verification == '1') {
                // 防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct('rd_accept');
            } else {
                Basic.add_person('rd_accept');

            }
        });
        //列印

        $("#download").on('click', function () {

            if (id.length == 0) {

                alert('未勾選項目');
                return false;
            }

            window.open(window._JS_BASEURL + 'PrintContent/Bug?PostData=' + Basic._webBaseEncode('SysData=' + id.join(",")), '_blank');
        });

        $("#print").on('click', function () {
            window.open(window._JS_BASEURL + 'PrintContent/Bug?PostData=' + Basic._webBaseEncode('SysData=' + print_id), '_blank');
        });

        //單號取消
        $("#cancel").on('click', function () {


            if (id.length == 0) {

                alert('未勾選項目');
                return false;
            } else {
                var sysid = 'SysData=' + id.join(",");
            }

            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Bug_ajax/is_enabled_status',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(sysid)
                },
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('單號取消成功');
                        location.href = window._JS_BASEURL + 'Bug';
                    } else {
                        alert(callback.message);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });


        });

        $("input:checkbox").on('click', function () {
            var $box = $(this);
            if ($box.is(":checked")) {

                var group = "input:checkbox[name='" + $box.attr("name") + "']";

                $(group).prop("checked", false);
                $box.prop("checked", true);
            } else {
                $box.prop("checked", false);
            }
        });


        $('#modal_form').keypress(function (e) {
            if (e.keyCode == 13) {
                if (Basic.getUrlVars()[0].split('/')[4] == 'create') {
                    Tool.ins();
                } else {
                    Tool.save();
                }


            }
        });

        //指定複核工程師
        $('#review_rd_appoint').click(function () {
            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Bug_ajax/code_reviewer',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(login_id + "_" + group_id)),
                },
                success: function (callback, status, xhr) {
                    let reviewer_result = callback.result
                    let reviewer_selection = ""
                    if (callback.status === 'SUCCESS') {
                        for (let i = 0; i <= Object.keys(reviewer_result)[Object.keys(reviewer_result).length - 1]; i++) {
                            if (typeof reviewer_result[i]?.staff_id == 'undefined' || typeof reviewer_result[i]?.user_name == 'undefined') continue
                            reviewer_selection += `
                    <option value="${reviewer_result[i]?.staff_id}">${reviewer_result[i]?.user_name}</option>
                    `
                        }
                    } else {
                        alert(callback.message)
                    }
                    $('#review_rd_appoint').after(
                        `
            <select class="reviewer-select form-control" name="appointed_reviewer">
            <option>名單</option>
            ${reviewer_selection}
            </select>
            `
                    )

                    $('#review_rd_appoint').hide()
                    $('.reviewer-select').focus()
                    $('.reviewer-select')[0].size = $('.reviewer-select')[0].options.length
                    $('.reviewer-select').change(function () {
                        if (confirm("請確認指定之複核工程師為：" + $('option:selected', this).text()) == true) {
                            var loginForm = $('#form-main').serializeArray();
                            // console.log(loginForm);
                            $.ajax({
                                type: "POST",
                                url: window._JS_BASEURL + 'Bug_ajax/update_order',
                                cache: false,
                                data: {
                                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                                },
                                success: function (callback, status, xhr) {
                                    // console.log(callback);
                                    if (callback.status === 'SUCCESS') {
                                        alert('更新成功');
                                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + Basic.getUrlVars()['PostData'] + '&check_sign=' + Basic.getUrlVars()['check_sign'];
                                    } else {
                                        alert('更新失敗');
                                    }
                                },
                                error: function (xhr, ajaxOptions, thrownError) {
                                    alert("網路可能不夠順暢，請稍候再嘗試。");
                                }
                            });
                        }
                    })

                    $('.reviewer-select').blur(function () {
                        $('#review_rd_appoint').show()
                        $('.reviewer-select').remove()
                    })
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後再嘗試。')
                },
            })
        })

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

        $.ajax({
            type: "POST",
            url: window._JS_BASEURL + 'Bug_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function (callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {

                    if (callback.flag === true) {
                        alert('新增成功,你需填寫文件簽核申請表');
                        location.href = window._JS_BASEURL + 'SignOff/create?PostData=' + callback.PostData;

                    } else {
                        alert('新增成功');
                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + callback.result;
                    }

                } else {
                    alert(callback.message);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });

    },
    //快速新增表單
    direct_ins: function direct_ins() {
        var loginForm = $('#form-main').serializeArray();
        // console.log(loginForm);
        $.ajax({
            type: "POST",
            url: window._JS_BASEURL + 'Bug_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function (callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {

                    if (callback.flag === true) {
                        alert('新增成功,你需填寫文件簽核申請表');
                        location.href = window._JS_BASEURL + 'SignOff/create?PostData=' + callback.PostData;

                    } else {
                        alert('新增成功');
                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + callback.result;
                    }
                } else {
                    alert(callback.message);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });

    },
    //簽名驗證
    save: function save() {
        var isclick = true;
        var pw = $("#pw").val() || null;
        var SysId = $("#sys_id").val() || null;
        if (pw === null) {
            alert('請輸入密碼')
            return false;
        }


        var signOffForm = $('#form').serializeArray();
        var loginForm = $('#form-main').serializeArray();
        var InfoData = signOffForm.concat(loginForm);


        InfoData.push({
            name: 'signoff',
            value: TableName
        })
        // console.log(InfoData);


        $.ajax({
            type: "POST",
            url: window._JS_BASEURL + 'Bug_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(InfoData))
            },
            success: function (callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {

                    if (callback.result.flag === true && callback.result.is_enable === true) {
                        alert('更新成功,需填寫文件簽核申請');
                        location.href = window._JS_BASEURL + 'SignOff/edit?PostData=' + callback.result.sys_id + '&date_status=1';
                    } else if (callback.result.flag === true && callback.result.is_enable === false) {
                        alert('更新成功,需填寫文件簽核申請');
                        location.href = window._JS_BASEURL + 'SignOff/create?PostData=' + callback.result.PostData;
                    } else {
                        alert('更新成功');
                        if (callback.result.check_sign == '1' && callback.result.SysData != null) {
                            location.href = window._JS_BASEURL + 'Bug?PostData=' + callback.result.SysData;
                        } else {
                            location.href = window._JS_BASEURL + 'Bug';
                        }

                    }


                } else {
                    alert(callback.message);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
    },
    //免驗證簽名
    direct: function direct(Name) {

        var loginForm = [];
        loginForm[0] = { name: 'signoff', value: Name };
        loginForm[1] = { name: 'sys_id', value: sys_id };
        loginForm[2] = { name: 'group_id', value: group_id };
        loginForm[3] = { name: 'process', value: process };
        loginForm[4] = { name: 'order_no', value: order_no };
        loginForm[5] = { name: 'title', value: title };
        loginForm[6] = { name: 'rd_approve', value: rd_approve };
        loginForm[7] = { name: 'rd_accept', value: rd_accept };
        loginForm[8] = { name: 'platform', value: platform };
        loginForm[9] = { name: 'creator', value: creator };
        loginForm[10] = { name: 'check_sign', value: check_sign };


        var signOffForm = $('#form-main').serializeArray();
        var InfoData = signOffForm.concat(loginForm);
        $.ajax({
            type: "POST",
            url: window._JS_BASEURL + 'Bug_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(InfoData))
            },
            success: function (callback, status, xhr) {
                // console.log(callback);
                if (callback.status === 'SUCCESS') {

                    if (callback.result.flag === true && callback.result.is_enable === true) {
                        alert('更新成功,需填寫文件簽核申請');
                        location.href = window._JS_BASEURL + 'SignOff/edit?PostData=' + callback.result.sys_id + '&date_status=1';
                    } else if (callback.result.flag === true && callback.result.is_enable === false) {
                        alert('更新成功,需填寫文件簽核申請');
                        location.href = window._JS_BASEURL + 'SignOff/create?PostData=' + callback.result.PostData;
                    } else {
                        alert('更新成功');
                        if (callback.result.check_sign == '1' && callback.result.SysData != null) {
                            location.href = window._JS_BASEURL + 'Bug?PostData=' + callback.result.SysData;
                        } else {
                            location.href = window._JS_BASEURL + 'Bug';
                        }

                    }



                } else {
                    alert(callback.message);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍候再嘗試。");
            }
        });
    }


};
jQuery(document).ready(function () {
    Page.init();
    var TableName = "";
});

// 編輯程式除錯單之x-data資料
let dataEdit = () => {
    return {
        bug_process: Number(process),
        bug_group_id: Number(group_id),
        bug_patch_type: Number(patch_type),
        bug_operation_type: Number(operation_type),
        bug_order_no: order_no,
        bug_title: title,
        bug_reviewers: '',
        temp_reviewer: '',
        bug_appointed_reviewer: appointed_reviewer,
        bug_appointed_reviewer_name: appointed_reviewer_name,
        bug_git: git,
        add_git: '',
        add_git_desc: '',
        line_flag: true,
        get_reviewer_list() {
            let _this = this;
            $.ajax({
                type: 'POST',
                url: window._JS_BASEURL + 'Bug_ajax/code_reviewer',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(login_id + "_" + group_id)),
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        $('#appointReviewer').modal('show');
                        _this.bug_reviewers = callback.result;
                    } else {
                        alert(callback.message);
                        $('#appointReviewer').modal('hide');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍候再嘗試。");
                }
            });
        },
        save_reviewer(){
            let loginForm = $('#form-main').serializeArray();
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Bug_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + Basic.getUrlVars()['PostData'] + '&check_sign=' + Basic.getUrlVars()['check_sign'];
                    } else {
                        alert('更新失敗');
                        $('#appointReviewer').modal('hide');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍候再嘗試。");
                    $('#appointReviewer').modal('hide');
                }
            });
        },
        checkEditable() {
            if (
                creator == login_id && this.bug_process <= 3) {
                $('#form-main input').prop('disabled', false);
                $('textarea').prop('readonlly', false);
            } else {
                $('#form-main input').prop('disabled', true);
                $('textarea').prop('readonly', true);

            }
        },
        save_git() {
            if(this.line_flag === true && this.add_git === ''){
                alert('請填寫git版號');
                return;
            }
            var loginForm = $('#form-main').serializeArray();
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Bug_ajax/update_order',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL + 'Bug/edit?PostData=' + Basic.getUrlVars()['PostData'] + '&check_sign=' + Basic.getUrlVars()['check_sign'];
                    } else {
                        alert('更新失敗');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        }
    }
}


