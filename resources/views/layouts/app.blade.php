<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.bunny.net/css?family=Nunito" rel="stylesheet">

    <!-- Scripts -->
    @vite(['resources/sass/app.scss', 'resources/js/app.js'])
    <script src='{{asset('js/moment.js')}}'></script>
    <script src='{{asset('js/moment-duration-format.js')}}'></script>

    <style>
        .navbar {
            position: relative;
            padding: .0rem 0rem;
        }

        .dropdown-menu {
            min-width: 1rem;
        }

        #badge {
            padding: 2px 5px;
            line-height: 20px;
            text-align: center;
            background-color: red;
            color: white;
            font-size: 12px;
            font-weight: 700;
            border-radius: 50%;
            position: relative;
            bottom: 15px;
            left: -15px;
        }
    </style>
    <script>
        window._JS_BASEURL = "{{ route('home') }}"
    </script>
</head>

<body>
    <div id="app">
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <a class="navbar-brand" href="{{route('dashboard')}}">簽核系統</a>
            <div class="collapse navbar-collapse" id="navbarNav1">
                <ul class="nav nav-tabs">
                    <!-- Dropdown -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-light" data-bs-toggle="dropdown" href="#"
                            id="navbardrop">表單申請</a>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" href="Bug">程式除錯單</a>
                            <a class="dropdown-item" href="Platform_operation">營運表單</a>
                            <a class="dropdown-item" href="Demand">需求單</a>
                            <a class="dropdown-item" href="SignOff">文件簽核申請表</a>
                            <a class="dropdown-item" href="Info">資訊需求申請單</a>
                            <a class="dropdown-item" href="Deploy">上版項目單</a>
                            <a class="dropdown-item" href="Data_process">資料使用申請單</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-light" data-bs-toggle="dropdown" href="#"
                            id="navbardrop">會員管理</a>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" href="Account/create">新增會員</a> <a class="dropdown-item"
                                href="/Account">會員資訊</a><a class="dropdown-item" href="Account/upload">簽名圖檔</a>
                        </div>
                    </li>
                </ul>
            </div>


            <nav class="navbar navbar-expand-lg navbar-light">
                <div x-data="{
                    time: 1200,
                    duration: '20:00',
                    interval: '',
                    origin_title: document.title,
                    timer(){
                        // clear timer and reset a new timer
                        clearInterval(this.interval)
                        this.interval = setInterval(() => {
                            this.time--
                            this.duration = moment.duration(this.time, 'seconds').format('mm:ss', { trim: false })
                            if(this.time == 30 ){
                                $('#countdown').modal('show');
                            }
                            if(this.time <= 30){
                                document.title = this.time + '秒後登出'
                            }
                            if (this.time <= 0) {
                                clearInterval(this.interval)
                                window.location.href = 'Sign_in/logout'
                            }
                        }, 1000)
                    }
                }" x-init="timer()">
                    <div class="p-2 text-black rounded bg-light">
                        <span class="text-white bg-primary" x-text="duration"></span> 後自動登出
                    </div>

                    <!-- modal -->
                    <div class="modal" tabindex="-1" role="dialog" id="countdown">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">系統即將登出(<span class="text-danger" x-text="duration"></span>)
                                    </h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <p>是否繼續使用？</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-dismiss="modal" @click="
                                        time=1200
                                        document.title = origin_title
                                        $.post(window._JS_BASEURL + 'Account_ajax/login_extend', function(data){
                                        })
                                        ">是</button>
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">否</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- modal end -->
                </div>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="mr-auto navbar-nav">
                        <li class="nav-item dropdown">
                            {{-- <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i id="picture" class='fas fa-bell fa-2x' style="color:white"></i>
                                <span id="badge" style="display:<?php if ($DeUndone['count'] == 0 && $InUndone['count'] == 0 && $InUndoneCancelled['count'] == 0 && $DpUndone['count'] == 0 && $DataUndone['count'] == 0 && $DataUndoneCancelled['count'] == 0) {
                                                                    echo 'none';
                                                                } ?>">
                                    <?php echo $DeUndone['count'] + $InUndone['count'] + $InUndoneCancelled['count'] + $DataUndone['count'] + $DataUndoneCancelled['count']+ $DpUndone['count']; ?>
                                </span>
                            </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdown" style="display:<?php if ($DeUndone['count'] == 0 && $InUndone['count'] == 0 && $InUndoneCancelled['count'] == 0 && $DpUndone['count'] == 0 && $DataUndone['count'] == 0 && $DataUndoneCancelled['count'] == 0) {
                                                                                                            echo 'none';
                                                                                                        } ?>">
                                <a class="dropdown-item <?= ($DeUndone['count'] == 0) ? " d-none" : "" ; ?>" href="
                                    <?php echo base_url() ?>Bug?PostData=
                                    <?= $DeUndone['sys_data'] ?>">除錯單:
                                    <?php echo $DeUndone['count'] ?>筆未簽核
                                </a>
                                <a class="dropdown-item <?= ($InUndone['count'] == 0) ? " d-none" : "" ; ?>" href="
                                    <?= base_url(); ?>Info?PostData=
                                    <?= $InUndone['sys_data'] ?>">資訊需求單:
                                    <?= $InUndone['count']; ?>筆未簽核
                                </a>
                                <a class="dropdown-item <?= ($InUndoneCancelled['count'] == 0) ? " d-none" : "" ; ?>"
                                    href="
                                    <?= base_url(); ?>Info/cancelled?PostData=
                                    <?= $InUndoneCancelled['sys_data'] ?>">資訊需求單:
                                    <?= $InUndoneCancelled['count']; ?>筆已取消
                                </a>
                                <a class="dropdown-item <?= ($DataUndone['count'] == 0) ? " d-none" : "" ; ?>" href="
                                    <?= base_url(); ?>Data_process?PostData=
                                    <?= $DataUndone['sys_data'] ?>">資料使用申請單:
                                    <?= $DataUndone['count']; ?>筆未簽核
                                </a>
                                <a class="dropdown-item <?= ($DataUndoneCancelled['count'] == 0) ? " d-none" : "" ; ?>"
                                    href="
                                    <?= base_url(); ?>Data_process/cancelled?PostData=
                                    <?= $DataUndoneCancelled['sys_data'] ?>">資料使用申請單:
                                    <?= $DataUndoneCancelled['count']; ?>筆已取消
                                </a>
                                <a class="dropdown-item <?= ($DpUndone['count'] == 0) ? " d-none" : "" ; ?>" href="
                                    <?= base_url(); ?>Deploy?PostData=
                                    <?= $DpUndone['sys_data'] ?>">上版項目單:
                                    <?= $DpUndone['count']; ?>筆未簽核
                                </a>

                            </div> --}}
                        </li>

                    </ul>

                </div>
            </nav>
            <div class="px-0 top-bar-item top-bar-item-right">
                <div class="dropdown d-none d-sm-flex">
                    <button aria-expanded="false" aria-haspopup="true" class="btn-account" data-bs-toggle="dropdown"
                        type="button"><span><img alt="" src="{{asset('img/user-admin.png')}}"></span> <span
                            class="text-white d-block account-summary pr-md-4 d-none"><span class="account-name">
                                <?php echo 'Name' ?>
                            </span><span class="account-description">
                                <?php echo 'GroupName' ?>
                            </span>
                        </span></button>
                    <div class="dropdown-arrow dropdown-arrow-left"></div>
                    <div class="dropdown-menu">
                        <div class="dropdown-divider"></div><a x-data="{}" class="dropdown-item"
                            @click="localStorage.clear()" href="Sign_in/logout"><span
                                class="dropdown-icon oi oi-account-logout"></span> 登出</a>
                    </div>
                </div>
            </div>
        </nav>

        <main class="py-4">
            @yield('content')
        </main>
    </div>
</body>

</html>