var Page = {
    init: function init() {
        this.table = this.initTable()
        this.handleEvents()
    },
    initTable: function initTable() {
        var self = this

    },
    handleEvents: function handleEvents() {
        var self = this

        //日期選擇套件
        flatpickr('.flatdatepickr', {
            locale: 'zh',
            maxDate: new Date().fp_incr(14),
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
                $('#date').val(dt)
            },
        })

        //從API取得當日資料
        date = $('#date').val().replaceAll('-', '/')

        // return
        $.ajax({
            type: 'GET',
            url: window._JS_BASEURL + 'Deploy_ajax/get_data',
            // cache: false,
            data: 'dates=' + date,
            success: function (callback, status, xhr) {
                //API查詢資料指定給result
                result = callback.result

                //若當日有資料，依序嘗試載入簡單、藍新或威肯之正式上版單
                if (result != []) {
                    if (Object.keys(result).includes('ezp')) {
                        if (Object.keys(result.ezp.platform).includes('general')) {
                            ezp_general()
                        } else if (Object.keys(result.ezp.platform).includes('emergency')) {
                            ezp_emergency()
                        }

                    } else if (Object.keys(result).includes('nwp')) {
                        if (Object.keys(result.nwp.platform).includes('general')) {
                            nwp_general()
                        } else if (Object.keys(result.nwp.platform).includes('emergency')) {
                            nwp_emergency()
                        }
                    } else if (Object.keys(result).includes('wcp')) {
                        if (Object.keys(result.wcp.platform).includes('general')) {
                            wcp_general()
                        } else if (Object.keys(result.wcp.platform).includes('emergency')) {
                            wcp_emergency()
                        }
                    } else {
                        $("#applicant_approve").attr('disabled', true)
                        // alert('本日無上版資料')
                    }
                }

                //開立群變動時，直接載入該群組正式上版單
                $('input[type=radio][name=group_id]').change(function () {
                    formal.checked = true
                    emergency.checked = false
                    $("#applicant_approve").attr('disabled', true)
                    // 先將已存在的需求單及除錯單欄位移除
                    $("#require").html(field_default)
                    $(".require-add").remove()
                    $("#debug").html(field_default)
                    $(".debug-add").remove()
                    switch ($('input[name=group_id]:checked').val()) {
                        //簡單
                        case "1":
                            if (Object.keys(result).includes("ezp")) {
                                ezp_general()
                            }
                            break
                        //藍新                            
                        case "2":
                            if (Object.keys(result).includes("nwp")) {
                                nwp_general()
                            }
                            break
                        //威肯
                        case "3":
                            if (Object.keys(result).includes("wcp")) {
                                wcp_general()
                            }
                            break
                        default:
                            break
                    }
                })

                //切換為正式上版時
                $('#formal').click(function () {
                    formal.checked = true
                    emergency.checked = false
                    $("#applicant_approve").attr('disabled', true)
                    // 先將已存在的需求單及除錯單欄位移除
                    $("#require").html(field_default)
                    $(".require-add").remove()
                    $("#debug").html(field_default)
                    $(".debug-add").remove()
                    switch ($('input[name=group_id]:checked').val()) {
                        //簡單
                        case "1":
                            if (Object.keys(result).includes("ezp")) {
                                ezp_general()
                            }
                            break
                        //藍新                            
                        case "2":
                            if (Object.keys(result).includes("nwp")) {
                                nwp_general()
                            }
                            break
                        //威肯
                        case "3":
                            if (Object.keys(result).includes("wcp")) {
                                wcp_general()
                            }
                            break
                        default:
                            break
                    }
                })

                //切換為緊急上版時
                $('#emergency').click(function () {
                    formal.checked = false
                    emergency.checked = true
                    $("#applicant_approve").attr('disabled', true)
                    // 先將已存在的需求單及除錯單欄位移除
                    $("#require").html(field_default)
                    $(".require-add").remove()
                    $("#debug").html(field_default)
                    $(".debug-add").remove()
                    switch ($('input[name=group_id]:checked').val()) {
                        //簡單
                        case "1":
                            if (Object.keys(result).includes("ezp")) {
                                ezp_emergency()
                            }
                            break
                        //藍新                            
                        case "2":
                            if (Object.keys(result).includes("nwp")) {
                                nwp_emergency()
                            }
                            break
                        //威肯
                        case "3":
                            if (Object.keys(result).includes("wcp")) {
                                wcp_emergency()
                            }
                            break
                        default:
                            break
                    }
                })
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('網路可能不夠順暢，請稍後在嘗試。')
            },
        })

        //選擇日期時，由API更新資料
        $('#date').change(function () {
            //從API取得當日資料
            date = $('#date').val().replaceAll('-', '/')
            // console.log(date)
            // return
            $.ajax({
                type: 'GET',
                url: window._JS_BASEURL + 'Deploy_ajax/get_data',
                // cache: false,
                data: 'dates=' + date,
                success: function (callback, status, xhr) {
                    // console.log(callback)
                    //API查詢資料指定給result
                    result = callback.result
                    console.log(result)

                    $("#require").html(field_default)
                    $(".require-add").remove()
                    $("#debug").html(field_default)
                    $(".debug-add").remove()
                    $("#applicant_approve").attr('disabled', true)
                    //若當日有資料，依序嘗試載入簡單、藍新或威肯之正式上版單或緊急上版單
                    if (result != []) {
                        if (Object.keys(result).includes('ezp')) {
                            if (Object.keys(result.ezp.platform).includes('general')) {
                                ezp_general()
                            } else if (Object.keys(result.ezp.platform).includes('emergency')) {
                                ezp_emergency()
                            }

                        } else if (Object.keys(result).includes('nwp')) {
                            if (Object.keys(result.nwp.platform).includes('general')) {
                                nwp_general()
                            } else if (Object.keys(result.nwp.platform).includes('emergency')) {
                                nwp_emergency()
                            }
                        } else if (Object.keys(result).includes('wcp')) {
                            if (Object.keys(result.wcp.platform).includes('general')) {
                                wcp_general()
                            } else if (Object.keys(result.wcp.platform).includes('emergency')) {
                                wcp_emergency()
                            }
                        } else {
                            $("#applicant_approve").attr('disabled', true)
                            // alert('本日無上版資料')
                        }
                    }

                    //開立群變動時，直接載入該群組正式上版單
                    $('input[type=radio][name=group_id]').change(function () {
                        formal.checked = true
                        emergency.checked = false
                        // 先將已存在的需求單及除錯單欄位移除
                        $("#require").html(field_default)
                        $(".require-add").remove()
                        $("#debug").html(field_default)
                        $(".debug-add").remove()
                        $("#applicant_approve").attr('disabled', true)
                        //先將簽核欄位disable
                        $("#applicant_approve").attr('disabled', true)
                        switch ($('input[name=group_id]:checked').val()) {
                            //簡單
                            case "1":
                                if (Object.keys(result).includes("ezp")) {
                                    ezp_general()
                                }
                                break
                            //藍新                            
                            case "2":
                                if (Object.keys(result).includes("nwp")) {
                                    nwp_general()
                                }
                                break
                            //威肯
                            case "3":
                                if (Object.keys(result).includes("wcp")) {
                                    wcp_general()
                                }
                                break
                            default:
                                break
                        }
                    })

                    //切換為正式上版時
                    $('#formal').click(function () {
                        formal.checked = true
                        emergency.checked = false
                        $("#applicant_approve").attr('disabled', true)
                        // 先將已存在的需求單及除錯單欄位移除
                        $("#require").html(field_default)
                        $(".require-add").remove()
                        $("#debug").html(field_default)
                        $(".debug-add").remove()
                        switch ($('input[name=group_id]:checked').val()) {
                            //簡單
                            case "1":
                                if (Object.keys(result).includes("ezp")) {
                                    ezp_general()
                                }
                                break
                            //藍新                            
                            case "2":
                                if (Object.keys(result).includes("nwp")) {
                                    nwp_general()
                                }
                                break
                            //威肯
                            case "3":
                                if (Object.keys(result).includes("wcp")) {
                                    wcp_general()
                                }
                                break
                            default:
                                break
                        }
                    })

                    //切換為緊急上版時
                    $('#emergency').click(function () {
                        formal.checked = false
                        emergency.checked = true
                        $("#applicant_approve").attr('disabled', true)
                        // 先將已存在的需求單及除錯單欄位移除
                        $("#require").html(field_default)
                        $(".require-add").remove()
                        $("#debug").html(field_default)
                        $(".debug-add").remove()
                        switch ($('input[name=group_id]:checked').val()) {
                            //簡單
                            case "1":
                                if (Object.keys(result).includes("ezp")) {
                                    ezp_emergency()
                                }
                                break
                            //藍新                            
                            case "2":
                                if (Object.keys(result).includes("nwp")) {
                                    nwp_emergency()
                                }
                                break
                            //威肯
                            case "3":
                                if (Object.keys(result).includes("wcp")) {
                                    wcp_emergency()
                                }
                                break
                            default:
                                break
                        }
                    })
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('網路可能不夠順暢，請稍後在嘗試。')
                },
            })
        })


        //申請人簽核
        $('#applicant_approve').on('click', function () {
            // return
            if (check_verification == '1') {
                //防止連點
                let that = $(this);
                $(that).attr('disabled', true);
                setTimeout(function () {
                    $(that).attr('disabled', false);
                }, 3000);
                Tool.direct_ins('applicant')
            } else {
                Basic.add_person('applicant')
            }
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


//上版項目預設空白欄位
const field_default = `
<td colspan="2" class="text-center">
&nbsp;
</td>
<td colspan="5">
</td>
<td colspan="1" class="text-center">
</td>
<td colspan="1" class="text-center">
</td>
<td colspan="1" class="text-center">
</td>
`

// 簡單，正式上版
function ezp_general() {
    //若無可簽核之資料時，將簽核按鍵disable
    ezp.checked = true
    formal.checked = true
    $('#ezpay').show();
    $('#nwpay').hide();
    $('#wcpay').hide();
    if (!Object.keys(result.ezp.platform).includes('general')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 26; i++) {
            if (result.ezp.platform.general.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷正式需求單是否存在
        if (!Object.keys(result.ezp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.ezp.require_no).includes('general')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.ezp.require_no.general).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.ezp.require_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.ezp.require_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="require[]" value="${Object.values(result.ezp.require_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.ezp.require_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="require[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.ezp.require_executor.general)[i]}">
            </tr>`
                )
            }
        }

        //判斷正式程式除錯單是否存在
        if (!Object.keys(result.ezp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.ezp.debug_no).includes('general')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.ezp.debug_no.general).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.ezp.debug_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.ezp.debug_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.ezp.debug_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.ezp.debug_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="debug[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.ezp.debug_executor.general)[i]}">
            </tr>`
                )
            }
        }
    }
}

// 簡單，緊急上版
function ezp_emergency() {
    ezp.checked = true
    emergency.checked = true
    $('#ezpay').show();
    $('#nwpay').hide();
    $('#wcpay').hide();
    //若無可簽核之資料時，將簽核按鍵disable
    if (!Object.keys(result.ezp.platform).includes('emergency')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 26; i++) {
            if (result.ezp.platform.emergency.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷緊急上版需求單是否存在
        if (!Object.keys(result.ezp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.ezp.require_no).includes('emergency')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.ezp.require_no.emergency).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="require[]" value="${Object.values(result.ezp.require_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.ezp.require_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="require[]" value="${Object.values(result.ezp.require_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="require[]" value="${Object.values(result.ezp.require_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="require[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.ezp.require_executor.emergency)[i]}">
</tr>`
                )
            }
        }

        //判斷緊急上版程式除錯單是否存在
        if (!Object.keys(result.ezp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.ezp.debug_no).includes('emergency')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.ezp.debug_no.emergency).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.ezp.debug_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.ezp.debug_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.ezp.debug_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.ezp.debug_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="debug[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.ezp.debug_executor.emergency)[i]}">
</tr>`
                )
            }
        }
    }
}

// 藍新，正式上版
function nwp_general() {
    nwp.checked = true
    formal.checked = true
    $('#nwpay').show();
    $('#ezpay').hide();
    $('#wcpay').hide();
    //若無可簽核之資料時，將簽核按鍵disable
    if (!Object.keys(result.nwp.platform).includes('general')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 26; i++) {
            if (result.nwp.platform.general.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷正式需求單是否存在
        if (!Object.keys(result.nwp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.nwp.require_no).includes('general')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.nwp.require_no.general).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.nwp.require_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.nwp.require_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="require[]" value="${Object.values(result.nwp.require_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.nwp.require_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="require[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.nwp.require_executor.general)[i]}">
            </tr>`
                )
            }
        }

        //判斷正式程式除錯單是否存在
        if (!Object.keys(result.nwp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.nwp.debug_no).includes('general')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.nwp.debug_no.general).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.nwp.debug_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.nwp.debug_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.nwp.debug_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.nwp.debug_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="debug[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.nwp.debug_executor.general)[i]}">
            </tr>`
                )
            }
        }
    }
}

// 藍新，緊急上版
function nwp_emergency() {
    nwp.checked = true
    emergency.checked = true
    $('#nwpay').show();
    $('#ezpay').hide();
    $('#wcpay').hide();
    //若無可簽核之資料時，將簽核按鍵disable
    if (!Object.keys(result.nwp.platform).includes('emergency')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 26; i++) {
            if (result.nwp.platform.emergency.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷緊急上版需求單是否存在
        if (!Object.keys(result.nwp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.nwp.require_no).includes('emergency')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.nwp.require_no.emergency).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="require[]" value="${Object.values(result.nwp.require_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.nwp.require_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="require[]" value="${Object.values(result.nwp.require_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="require[]" value="${Object.values(result.nwp.require_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="require[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.nwp.require_executor.emergency)[i]}">
</tr>`
                )
            }
        }

        //判斷緊急上版程式除錯單是否存在
        if (!Object.keys(result.nwp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.nwp.debug_no).includes('emergency')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.nwp.debug_no.emergency).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.nwp.debug_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.nwp.debug_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.nwp.debug_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.nwp.debug_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="debug[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.nwp.debug_executor.emergency)[i]}">
</tr>`
                )
            }
        }
    }
}
// 威肯，正式上版
function wcp_general() {
    wcp.checked = true
    formal.checked = true
    $('#wcpay').show();
    $('#ezpay').hide();
    $('#nwpay').hide();
    //若無可簽核之資料時，將簽核按鍵disable
    if (!Object.keys(result.wcp.platform).includes('general')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 29; i++) {
            if (result.wcp.platform.general.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷正式需求單是否存在
        if (!Object.keys(result.wcp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.wcp.require_no).includes('general')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.wcp.require_no.general).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.wcp.require_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.wcp.require_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="require[]" value="${Object.values(result.wcp.require_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="require[]" value="${Object.values(result.wcp.require_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="require[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.wcp.require_executor.general)[i]}">
            </tr>`
                )
            }
        }

        //判斷正式程式除錯單是否存在
        if (!Object.keys(result.wcp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.wcp.debug_no).includes('general')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.wcp.debug_no.general).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
            <td colspan="2" class="text-center">
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.wcp.debug_no.general)[i]}" readonly>
            </td>
            <td colspan="5">
            <textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.wcp.debug_desc.general)[i]}</textarea>
            </td>
            <td colspan="1" class="text-center">
            <input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.wcp.debug_executor.general)[i]}" readonly>
            <input class="form-control" type="text" name="debug[]" value="${Object.values(result.wcp.debug_executor_name.general)[i]}" readonly>
            </td>
            <td colspan="1" class="text-center">
            <input type="checkbox" onclick="return false">
            </td>
            <td colspan="1" class="text-center">
            <input type="hidden" name="debug[]" value="">
            </td>
            <input type="hidden" name="reviewers[]" value="${Object.values(result.wcp.debug_executor.general)[i]}">
            </tr>`
                )
            }
        }
    }
}

// 威肯，緊急上版
function wcp_emergency() {
    wcp.checked = true
    emergency.checked = true
    $('#wcpay').show();
    $('#ezpay').hide();
    $('#nwpay').hide();
    //若無可簽核之資料時，將簽核按鍵disable
    if (!Object.keys(result.wcp.platform).includes('emergency')) {
        $("#applicant_approve").attr('disabled', true)
    } else {
        //每次均重新遍歷全部平台碼更新，須注意i的型別，有資料時才做
        for (let i = 1; i <= 29; i++) {
            if (result.wcp.platform.emergency.includes(i.toString())) {
                $('#' + 'platform' + i).attr("checked", true)
            } else {
                $('#' + 'platform' + i).attr("checked", false)
            }
        }
        //有簽核資料，將簽核按鍵enable
        $("#applicant_approve").attr('disabled', false)
        //判斷緊急上版需求單是否存在
        if (!Object.keys(result.wcp).includes('require_no')) {
            $("#require").html(field_default)
        } else if (Object.keys(result.wcp.require_no).includes('emergency')) {
            require_html = []
            $("#require").html('')
            for (let i = 0; i < Object.values(result.wcp.require_no.emergency).length; i++) {
                $("#require").after(
                    `<tr class="require-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="require[]" value="${Object.values(result.wcp.require_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="require[]" rows="4" readonly>${Object.values(result.wcp.require_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="require[]" value="${Object.values(result.wcp.require_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="require[]" value="${Object.values(result.wcp.require_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="require[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.wcp.require_executor.emergency)[i]}">
</tr>`
                )
            }
        }

        //判斷緊急上版程式除錯單是否存在
        if (!Object.keys(result.wcp).includes('debug_no')) {
            $("#debug").html(field_default)
        } else if (Object.keys(result.wcp.debug_no).includes('emergency')) {
            debug_html = []
            $("#debug").html('')
            for (let i = 0; i < Object.values(result.wcp.debug_no.emergency).length; i++) {
                $("#debug").after(
                    `<tr class="debug-add">
<td colspan="2" class="text-center">
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.wcp.debug_no.emergency)[i]}" readonly>
</td>
<td colspan="5">
<textarea class="form-control" name="debug[]" rows="4" readonly>${Object.values(result.wcp.debug_desc.emergency)[i]}</textarea>
</td>
<td colspan="1" class="text-center">
<input class="form-control" type="hidden" name="debug[]" value="${Object.values(result.wcp.debug_executor.emergency)[i]}" readonly>
<input class="form-control" type="text" name="debug[]" value="${Object.values(result.wcp.debug_executor_name.emergency)[i]}" readonly>
</td>
<td colspan="1" class="text-center">
<input type="checkbox" onclick="return false">
</td>
<td colspan="1" class="text-center">
<input type="hidden" name="debug[]" value="">
</td>
<input type="hidden" name="reviewers[]" value="${Object.values(result.wcp.debug_executor.emergency)[i]}">
</tr>`
                )
            }
        }
    }
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
                alert('網路可能不夠順暢，請稍後在嘗試。')
            },
        })
    },
    //快速新增表單
    direct_ins: function direct_ins() {
        var loginForm = $('#form-main').serializeArray()
        // console.log(loginForm)
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + 'Deploy_ajax/create_order',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm)),
            },
            success: function (callback, status, xhr) {
                console.log(callback)
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
            url: window._JS_BASEURL + '/Deploy_ajax/create_order',
            cache: false,
            data: {
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
                            location.href = window._JS_BASEURL + 'Deploy'
                        }
                    }
                } else {
                    alert(callback.message)
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
        loginForm[7] = { name: 'dept', value: dept }

        var signOffForm = $('#form-main').serializeArray()
        var InfoData = signOffForm.concat(loginForm)
        $.ajax({
            type: 'POST',
            url: window._JS_BASEURL + '/Deploy_ajax/create_order',
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
                                window._JS_BASEURL + 'Deploy?PostData=' + callback.result.SysData
                        } else {
                            location.href = window._JS_BASEURL + 'Deploy'
                        }
                    }
                } else {
                    alert(callback.message)
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
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
