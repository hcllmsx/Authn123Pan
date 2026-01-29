<?php
/*
Plugin Name: Authn123Pan-WordPress
Plugin URI: https://github.com/hcllmsx/Authn123Pan
Description: 为WordPress内容中的123云盘的直链添加URL鉴权
Version: 2.0.0
Author: hcllmsx
*/

// 在插件列表页面添加设置链接
function authn123pan_plugin_action_links($links)
{
    $settings_link = '<a href="admin.php?page=authn123pan">设置</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'authn123pan_plugin_action_links');

// 加载插件样式和处理SVG图标
function authn123pan_admin_menu_style()
{
    // 加载外部CSS文件
    wp_enqueue_style('authn123pan-admin-style', plugins_url('authn123pan-style.css', __FILE__));

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
function authn123pan_settings_page()
{
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
function authn123pan_options_page()
{ ?>
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
function authn123pan_init()
{
    register_setting('authn123pan_group', 'authn123pan_uid');
    register_setting('authn123pan_group', 'authn123pan_private_key');
    register_setting('authn123pan_group', 'authn123pan_domains');
    register_setting('authn123pan_group', 'authn123pan_valid_duration');

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

    // 添加域名列表字段
    add_settings_field(
        'authn123pan_domains',
        '123云盘直链域名',
        'authn123pan_domains_callback',
        'authn123pan',
        'authn123pan_main_section'
    );

    // 添加有效期字段
    add_settings_field(
        'authn123pan_valid_duration',
        '签名有效期',
        'authn123pan_valid_duration_callback',
        'authn123pan',
        'authn123pan_main_section'
    );
}
add_action('admin_init', 'authn123pan_init');

// 内容过滤处理
function authn123pan_filter_content($content)
{
    $uid = get_option('authn123pan_uid');
    $private_key = get_option('authn123pan_private_key');
    $domains_input = get_option('authn123pan_domains');
    $valid_duration = get_option('authn123pan_valid_duration');

    if (empty($uid) || empty($private_key)) {
        return $content;
    }

    // 设置默认有效期为900秒（15分钟）
    if (empty($valid_duration) || !is_numeric($valid_duration)) {
        $valid_duration = 900;
    }

    // 解析域名列表（支持逗号、空格、换行符分隔）
    $domains = authn123pan_parse_domains($domains_input);

    if (empty($domains)) {
        return $content;
    }

    // 构建动态正则表达式匹配多个域名
    $escaped_domains = array_map(function ($domain) {
        return preg_quote($domain, '/');
    }, $domains);
    $domain_pattern = implode('|', $escaped_domains);
    $pattern = '/(https?:\/\/(' . $domain_pattern . ')[^"\'\s<>]+)/';

    return preg_replace_callback(
        $pattern,
        function ($matches) use ($uid, $private_key, $valid_duration) {
            return authn123pan_sign_url($matches[1], $private_key, $uid, $valid_duration);
        },
        $content
    );
}
add_filter('the_content', 'authn123pan_filter_content');

// 签名生成函数
function authn123pan_sign_url($url, $private_key, $uid, $valid_duration = 900)
{
    $expire_time = time() + intval($valid_duration); // 使用配置的有效期，默认900秒（15分钟）
    $rand_value = rand(0, 100000);

    $parsed_url = parse_url($url);
    $request_path = rawurldecode($parsed_url['path']);

    $signature = md5("{$request_path}-{$expire_time}-{$rand_value}-{$uid}-{$private_key}");
    $auth_key = "{$expire_time}-{$rand_value}-{$uid}-{$signature}";

    return $url . "?auth_key={$auth_key}";
}

// 新增设置部分回调函数
function authn123pan_section_callback()
{
    echo '请输入您的123云盘UID和鉴权密钥';
}

// 新增UID字段回调函数
function authn123pan_uid_callback()
{
    $uid = get_option('authn123pan_uid');
    echo "<input type='text' name='authn123pan_uid' value='{$uid}' />";
}

// 新增密钥字段回调函数
function authn123pan_private_key_callback()
{
    $key = get_option('authn123pan_private_key');
    echo "<input type='text' name='authn123pan_private_key' value='{$key}' class='authn123pan-key-input regular-text' autocomplete='off' />";
}

// 新增域名列表字段回调函数
function authn123pan_domains_callback()
{
    $domains = get_option('authn123pan_domains');
    // 如果为空，设置默认值
    if (empty($domains)) {
        $domains = "vip.123pan.cn\nv.123pan.cn";
    }
    echo "<textarea name='authn123pan_domains' rows='5' class='large-text code'>" . esc_textarea($domains) . "</textarea>";
    echo "<p class='description'>请输入123云盘直链域名，每行一个。支持多个域名。<br>";
    echo "<strong>默认包含：</strong><code>vip.123pan.cn</code> 和 <code>v.123pan.cn</code><br>";
    echo "如需添加其他域名，请在上方输入框中每行添加一个域名。</p>";
}

// 新增有效期字段回调函数
function authn123pan_valid_duration_callback()
{
    $duration = get_option('authn123pan_valid_duration');
    // 如果为空，设置默认值为900秒（15分钟）
    if (empty($duration)) {
        $duration = "900";
    }
    echo "<input type='number' name='authn123pan_valid_duration' value='{$duration}' min='1' class='small-text' /> 秒";
    echo "<p class='description'>签名链接的有效期，单位为秒。<br>";
    echo "<strong>默认值：</strong>900秒（15分钟）<br>";
    echo "<strong>建议范围：</strong>60-3600秒（1分钟到1小时）</p>";
}

// 解析域名列表的辅助函数
function authn123pan_parse_domains($input)
{
    if (empty($input)) {
        // 默认域名列表
        return ['vip.123pan.cn', 'v.123pan.cn'];
    }

    // 按换行、逗号、分号、空格分隔
    $domains = preg_split('/[\r\n,;\s]+/', $input, -1, PREG_SPLIT_NO_EMPTY);

    // 去除空白并过滤空值
    $domains = array_map('trim', $domains);
    $domains = array_filter($domains);

    // 去重
    $domains = array_unique($domains);

    return array_values($domains);
}
