<?php
/*
Plugin Name: Authn123Pan-forWP
Plugin URI: https://github.com/hcllmsx/Authn123Pan
Description: 为WordPress内容中的123云盘的直链添加URL鉴权
Version: 1.0.6
Author: hcllmsx
*/

// 在插件列表页面添加设置链接
function authn123pan_plugin_action_links($links) {
    $settings_link = '<a href="admin.php?page=authn123pan">设置</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'authn123pan_plugin_action_links');

// 加载插件样式和处理SVG图标
function authn123pan_admin_menu_style() {
    // 加载外部CSS文件
    wp_enqueue_style('authn123pan-admin-style', plugins_url('admin-style.css', __FILE__));
    
    // 获取并处理SVG图标
    $svg_path = plugin_dir_path(__FILE__) . 'logo123pan.svg';
    if (file_exists($svg_path)) {
        $svg_content = file_get_contents($svg_path);
        $svg_base64 = 'data:image/svg+xml;base64,' . base64_encode($svg_content);
        // 输出SVG相关的动态样式，增加 !important 以确保样式生效
        echo '<style>
            #adminmenu .toplevel_page_authn123pan .wp-menu-image {
                background-image: url("' . $svg_base64 . '") !important;
            }
        </style>';
    }
}
add_action('admin_enqueue_scripts', 'authn123pan_admin_menu_style');

// 注册主菜单页面 - 在WordPress后台左侧添加顶级菜单
function authn123pan_settings_page() {
    // 添加顶级菜单
    add_menu_page(
        'Authn123Pan-forWP 设置', // 页面标题
        '123云盘直链鉴权',      // 菜单标题
        'manage_options',   // 权限
        'authn123pan',      // 菜单slug
        'authn123pan_options_page', // 回调函数
        '', // 图标URL - 我们使用CSS来添加SVG图标
        81  // 位置 - 设置在81，通常会出现在"设置"菜单下方
    );
}
add_action('admin_menu', 'authn123pan_settings_page');

// 设置页面内容
function authn123pan_options_page() { ?>
    <div class="wrap">
        <h1>Authn123Pan-forWP 设置</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('authn123pan_group');
            do_settings_sections('authn123pan');
            submit_button();
            ?>
        </form>
    </div>
<?php }

// 注册设置字段
function authn123pan_init() {
    register_setting( 'authn123pan_group', 'authn123pan_uid' );
    register_setting( 'authn123pan_group', 'authn123pan_private_key' );

    // 添加设置部分
    add_settings_section(
        'authn123pan_main_section',
        '123云盘设置',
        'authn123pan_section_callback',
        'authn123pan'
    );

    // 添加UID字段
    add_settings_field(
        'authn123pan_uid',
        '123云盘UID',
        'authn123pan_uid_callback',
        'authn123pan',
        'authn123pan_main_section'
    );

    // 添加密钥字段
    add_settings_field(
        'authn123pan_private_key',
        '鉴权密钥',
        'authn123pan_private_key_callback',
        'authn123pan',
        'authn123pan_main_section'
    );
}
add_action('admin_init', 'authn123pan_init');

// 内容过滤处理
function authn123pan_filter_content($content) {
    $uid = get_option('authn123pan_uid');
    $private_key = get_option('authn123pan_private_key');
    
    if (empty($uid) || empty($private_key)) {
        return $content;
    }

    return preg_replace_callback(
        '/(https?:\/\/vip\.123pan\.cn[^"\' ]+)/', // 已经严格匹配vip.123pan.cn域名
        function($matches) use ($uid, $private_key) {
            return authn123pan_sign_url($matches[1], $private_key, $uid);
        },
        $content
    );
}
add_filter('the_content', 'authn123pan_filter_content');

// 签名生成函数
function authn123pan_sign_url($url, $private_key, $uid) {
    $expire_time = time() + 60; // 60秒有效期
    $rand_value = rand(0, 100000);

    $parsed_url = parse_url($url);
    $request_path = rawurldecode($parsed_url['path']);

    $signature = md5("{$request_path}-{$expire_time}-{$rand_value}-{$uid}-{$private_key}");
    $auth_key = "{$expire_time}-{$rand_value}-{$uid}-{$signature}";

    return $url . "?auth_key={$auth_key}";
}

// 新增设置部分回调函数
function authn123pan_section_callback() {
    echo '请输入您的123云盘UID和鉴权密钥';
}

// 新增UID字段回调函数
function authn123pan_uid_callback() {
    $uid = get_option('authn123pan_uid');
    echo "<input type='text' name='authn123pan_uid' value='{$uid}' />";
}

// 新增密钥字段回调函数
function authn123pan_private_key_callback() {
    $key = get_option('authn123pan_private_key');
    echo "<input type='text' name='authn123pan_private_key' value='{$key}' class='authn123pan-key-input regular-text' autocomplete='off' />";
}
