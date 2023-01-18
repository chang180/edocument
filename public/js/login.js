var Page = {
    init: function init() {

        this.handleEvents();
    },


    handleEvents: function handleEvents() {
        var self = this;
        //登入

        $("#btnLogin").on('click', function () {
            var loginForm = $('#form-main').serializeArray();
            $('#btnLogin').prop('disabled', true);
            $('#disable-enter').show();
            setTimeout(function () {
                $('#disable-enter').hide();
                $('#btnLogin').prop('disabled', false);
            }, 3000);
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Sign_in/login_verify',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    if (typeof callback.token !== 'undefined') {
                        localStorage.setItem('member_token', callback.token);
                    }
                    if (callback.status === 'SUCCESS') {
                        if (callback.data !== '') {
                            location.href = window._JS_BASEURL + callback.uri + '?PostData=' + callback.data;
                        } else {
                            location.href = window._JS_BASEURL + 'Info';
                        }
                    } else {
                        alert(callback.message);
                    }

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");

                }
            });


        });

        $("#CheckNewPwd").keypress(function (event) {
            if (event.keyCode === 13) {
                $("#btnForgot").click();
            }
        });

        //密碼更換
        $("#btnForgot").on('click', function () {

            var loginForm = $('#form-main').serializeArray();
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Forgot_password/modify_password',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('修改成功');

                        location.href = window._JS_BASEURL;
                    } else {
                        alert(callback.message);
                    }

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");

                }
            });


        });

        //密碼重置
        $("#btnReset").on('click', function () {
            var loginForm = $('#form-main').serializeArray();
            $.ajax({
                type: "POST",
                url: window._JS_BASEURL + 'Forgot_password/get_user_password',
                cache: false,
                data: {
                    send_data_: Basic._webBaseEncode(jQuery.param(loginForm))
                },
                success: function (callback, status, xhr) {
                    // console.log(callback);
                    if (callback.status === 'SUCCESS') {
                        alert('已將重置連結寄到您的信箱');
                        location.href = window._JS_BASEURL;
                    } else {
                        alert(callback.message);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("網路可能不夠順暢，請稍後在嘗試。");
                }
            });
        });
    }
};



jQuery(document).ready(function () {
    Page.init();
});

let loginData = () => {
    return {
        token: localStorage.getItem('member_token'),
        auto: false,
        account: '',
        password: '',
        disableEnter: false,
        switch_token() {
            if (!this.auto) {
                localStorage.clear();
            }
        },
        autoLogin() {
            if (this.token) {
                $.ajax({
                    type: "POST",
                    url: window._JS_BASEURL + 'Sign_in/auto_login',
                    cache: false,
                    data: {
                        token: this.token
                    },
                    success: function (callback, status, xhr) {
                        if (callback.status === 'SUCCESS') {
                            alert('系統已自動登入')
                            location.href = window._JS_BASEURL + 'Info'
                        } else {
                            alert(callback.message);
                            localStorage.clear();
                            this.auto = false;
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert("請重新登入");
                        localStorage.clear();
                        this.auto = false;
                    }
                });
            }
        },
        pressEnter() {
            let that = this;
            if (this.account !== '' && this.password !== '' && !this.disableEnter) {
                this.disableEnter = true;
                this.account = this.password = '';
                $("#btnLogin").click();
                $("#btnLogin").prop('disabled', true);
                setTimeout(function () {
                    that.disableEnter = false;
                    $("#btnLogin").prop('disabled', false);
                }, 3000);
            } else if(this.account === '' && !this.disableEnter || this.password === '' && !this.disableEnter){
                alert('帳號或密碼不得為空值')
            }
        }
    }
}