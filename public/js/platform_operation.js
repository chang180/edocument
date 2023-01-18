var Page = {
    init: function init() {
        this.table = this.initTable();
        this.handleEvents();

      
    },
    initTable: function initTable() {
        var self = this;
        var check_sign=0;
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
                [5, "desc"]
            ],
            ajax: function(data, callback, settings) {
                var data_url = window._JS_BASEURL+'Platform_operation_ajax/get_list';
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
                        console.log(getstatus);
                        var returnData = {};
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

            {               
                title: '單號',
                data: 'po_order_no',
				orderable: false

            },{title: '建立者',orderable: false, render: function (data, type, row, meta) {
						return "<span>"+row.mb_user_name+"("+row.mb_staff_id+")</span>";

                           
                     }
            }, {
                title: '主旨',
                data: 'po_title',
                orderable: false

            },{title: '公司',orderable: false, render: function (data, type, row, meta) {
                    
                            if(row.po_group_id==='1'){
                                return "<span>簡單</span>";
                            }
                            if(row.po_group_id==='2'){
                                return "<span>藍新</span>";
                            }

                            if(row.po_group_id==='3'){
                                return "<span>威肯</span>";
                            }
							
							if(row.po_group_id==='4'){
                                return "<span>群心</span>";
                            }
							
							if(row.po_group_id===''){
                                return "<span>-</span>";
                            }
                     }
            },{title: '表單類型',orderable: false, render: function (data, type, row, meta) {
                    
                            if(row.po_platform_type==='1'){
                                return "<span>平台營運表單</span>";
                            }
                            if(row.po_platform_type==='2'){
                                return "<span>公司行政表單</span>";
                            }

                            if(row.po_platform_type==='3'){
                                return "<span>簽呈</span>";
                            }
                            
                            if(row.po_platform_type==='4'){
                                return "<span>蓋用印信申請單</span>";
                            }
                            
                          
                     }
            }, {
                title: '建立日期',
                data: 'po_create_time'
            }, {
                title: '詳細資料', orderable: false,

                render: function(data, type, row, meta) {
                    return '<a class="btn btn-sm btn-secondary" href="'+window._JS_BASEURL+'Platform_operation/edit?PostData=' + row.po_sys_id +'" target="_blank"><i class="fa fa-list-alt"></i> 詳細資料</a>';
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


        $("#download").on('click', function() {

            var tempwindow=window.open('_blank');

            tempwindow.location.href = window._JS_BASEURL+'PrintPlatform/Platform?PostData='+Basic.getUrlVars()['PostData'];
         });


         $("#signoff").on('click', function() {

            var tempwindow=window.open('_blank');

            tempwindow.location.href = window._JS_BASEURL+'PrintPlatform/SignOff?PostData='+Basic.getUrlVars()['PostData'];
         });


       

       
		//新增
         $("#ins").on('click', function() {
		
           
            var upload_date=$("#upload").val();
		    var group_id = $("#group_id option:selected").val();
            var platform_type = $("#platform_type option:selected").val();
			var title = $("#title").val() || null;
            var platform_id = $("#platform_id").val() || null;

			//var _extStart 	= upload_date.lastIndexOf(".");
		 	//var _ext		= upload_date.substring(_extStart, upload_date.length).toUpperCase();	
			console.log(upload_date);
			if(group_id==null){
               alert('請選公司別');
               return false;

            } 
			if(title==null){
               alert('請填寫主旨');
               return false;

            } 
			if(platform_type==null){
               alert('請選擇表單類型');
               return false;

            } 

            if(platform_id==null){
               alert('請填寫表單項目');
               return false;

            } 
			
			
			

            var data = new FormData($('#form1')[0]);
                data.append('competence', Tool.list_select());

            

            $.ajax({
                url: window._JS_BASEURL+'Platform_operation_ajax/create',
                type: 'POST',
                data: data,
                dataType: 'JSON',
                cache: false,
                processData: false,
                contentType: false,
                success: function(callback, status, xhr) {
                    console.log(callback);
                    if(callback.status=='SUCCESS'){
                      alert('表單建立成功');
                      location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+callback.result;
                    }else{
                        alert(callback.message);
   
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
         });
        //更新
        $("#upt").on('click', function() {
            
            var loginForm = $('#form-main').serializeArray();
             // loginForm.push({
             //    name: 'competence',
             //    value: Tool.list_select()
             // })
            console.log(loginForm);
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'Platform_operation_ajax/update',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+Basic.getUrlVars()['PostData'];
                    } else {
                        alert('更新失敗');
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
      
        $('#modal_form').keypress(function(e) {
          if(e.keyCode==13){
            //Tool.save();
	        e.preventDefault();

          }
      });

    }
};



var Tool = {
    
     updating_files: function updating_files() {
        Basic.add_updating();


    },

    send_updating: function send_updating() {

         var data = new FormData($('#form_updating')[0]);

         $.ajax({
                url: window._JS_BASEURL+'Platform_operation_ajax/updating',
                type: 'POST',
                data: data,
                dataType: 'JSON',
                cache: false,
                processData: false,
                contentType: false,
                success: function(callback, status, xhr) {
                    console.log(callback);
                    if(callback.status=='SUCCESS'){
                      alert('檔案上傳成功');
                      location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+callback.result;
                    }else{
                        alert(callback.message);
   
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });


    },



    assign: function assign() {
        var loginForm = [];
        loginForm.push({
            name: 'competence',
            value: Tool.list_select()
        })
         loginForm.push({
            name: 'sys_id',
            value:sys_id
        })
        console.log(loginForm);
        $.ajax({
                type: "POST",
                url: window._JS_BASEURL+'Platform_operation_ajax/update',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function(callback, status, xhr) {
                    console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('更新成功');
                        location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+Basic.getUrlVars()['PostData'];
                    } else {
                        alert('更新失敗');
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });

    },
    send_mail: function send_mail() {
        Basic.add_mail();


    },

    show_competence: function show_competence() {
        Basic.add_competence();


    },


    send_message: function send_message() {

        var list_message_select=Tool.list_message_select();

        if(list_message_select==''){
            alert("請選則寄件者");
            return false;
        }

        var loginForm = $('#form-main').serializeArray();
             loginForm.push({
                name: 'user_list',
                value: list_message_select
             })
              loginForm.push({
                name: 'link',
                value: location.href
             })

              console.log(loginForm );

        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'Platform_operation_ajax/send_message',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function(callback, status, xhr) {
                         console.log(callback);

                if (callback.status === 'SUCCESS') {
                  
                    alert("寄信成功");

                } else {
                    alert(callback.message);

                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });


    },


    platform_type: function platform_type(i,d) {



        if(i==''){
          $('#platform_id').html('<option>請選擇</option>');
            return false;
        }


        var loginForm= [];
        loginForm.push({
            name: 'type',
            value: i
        })

        if(d!=''){
            loginForm.push({
            name: 'check_id',
            value: d
        })
        }


         console.log(loginForm);


        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'Platform_operation_ajax/platform_type',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function(callback, status, xhr) {
                         console.log(callback);

                if (callback.status === 'SUCCESS') {
                  
                    $('#platform_id').html(callback.result);
                    

                } else {
                    $('#platform_id').html('<option>請選擇</option>');
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
    },

    list_select: function list_select(i) {
        var list=[]
         $("#lstview_to option").map(function(){
           list.push( $(this).val());
        });

         return list.join(",");

    },


     list_message_select: function list_message_select(i) {
        var list=[]
         $("#keepRenderingSort_to option").map(function(){
           list.push( $(this).val());
        });

         return list.join(",");

    },
	
	mark_show: function mark_show(i) {
		console.log(i);
		 var sign_data=i.split('|');
		 $('#sign_content').html('<h5>簽核人員:'+sign_data[0]+'</h5><h5>簽核日期:'+sign_data[1]+'</h5>');
		 $('#myModal').modal('show'); // show bootstrap modal
	

	},

    cancel: function cancel(i) {
        
        var loginForm= $('#form-main').serializeArray();
          loginForm.push({
            name: 'cancel',
            value: i
        })

        console.log(loginForm);

        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'Platform_operation_ajax/cancel',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
            },
            success: function(callback, status, xhr) {
                console.log(callback);
                if (callback.status === 'SUCCESS') {
                  
                    alert('取消成功');
                    location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+callback.result;
                    

                } else {
                    alert(callback.message);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
        
    

    },
 
	sign: function sign(i) {
		SignNumber=i;
		if(check_verification=='1'){
			$("#check_sign").remove();

		}
			Basic.add_person();

	},
    //簽名驗證
    save: function save() {
        var pw = $("#pw").val() || null;
        var SysId = $("#sys_id").val() || null;
        if (pw === null && check_verification =='') {
            alert('請輸入密碼')
            return false;
        }

     
      var signOffForm= $('#form').serializeArray();
      var loginForm= $('#form-main').serializeArray();
      var InfoData= signOffForm.concat(loginForm);
            

        InfoData.push({
            name: 'SignNumber',
            value: SignNumber
        })
		
		
		
		console.log(InfoData);
        
       
        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'Platform_operation_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(InfoData))
            },
            success: function(callback, status, xhr) {
                console.log(callback);
                if (callback.status === 'SUCCESS') {
                  
                    alert('簽核完成');
                    location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+callback.result.sys_id;
                    

                } else {
                    alert(callback.message);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
    },
	
	mark: function mark() {
		
        var pw = $("#pw").val() || null;
        var SysId = $("#sys_id").val() || null;
        if (pw === null && check_verification =='') {
            alert('請輸入密碼')
            return false;
        }

     
      var signOffForm= $('#form').serializeArray();
      var loginForm= $('#form-main').serializeArray();
      var InfoData= signOffForm.concat(loginForm);
            

        InfoData.push({
            name: 'SignNumber',
            value: SignNumber
        })
		
		InfoData.push({
            name: 'Mark',
            value: 1
        })
		
		
		
		console.log(InfoData);
        
       
        $.ajax({
            type: "POST",
            url: window._JS_BASEURL+'Platform_operation_ajax/sign_off',
            cache: false,
            data: {
                send_data_: Basic._webBaseEncode(jQuery.param(InfoData))
            },
            success: function(callback, status, xhr) {
                console.log(callback);
                if (callback.status === 'SUCCESS') {
                  
                    alert('簽核完成');
                    location.href = window._JS_BASEURL+'Platform_operation/edit?PostData='+callback.result.sys_id;
                    

                } else {
                    alert(callback.message);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                alert("網路可能不夠順暢，請稍後在嘗試。");
            }
        });
		
	}


};
jQuery(document).ready(function() {
    Page.init();
    var TableName = "";
	var SignNumber = "";



 
});