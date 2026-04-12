<?php
if (! defined('ABSPATH')) {
    exit;
}

define('MIKROLIVING_THEME_VERSION', '1.0.0');

require_once get_template_directory() . '/inc/rest.php';

function mikroliving_theme_setup()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 96,
            'width'       => 320,
            'flex-height' => true,
            'flex-width'  => true,
        )
    );

    register_nav_menus(
        array(
            'primary' => __('Primary Menu', 'mikroliving-theme'),
        )
    );
}
add_action('after_setup_theme', 'mikroliving_theme_setup');

function mikroliving_enqueue_assets()
{
    wp_enqueue_style('mikroliving-style', get_stylesheet_uri(), array(), MIKROLIVING_THEME_VERSION);
    wp_enqueue_style(
        'mikroliving-theme',
        get_template_directory_uri() . '/assets/css/theme.css',
        array('mikroliving-style'),
        MIKROLIVING_THEME_VERSION
    );
}
add_action('wp_enqueue_scripts', 'mikroliving_enqueue_assets');

function mikroliving_register_content_types()
{
    register_post_type(
        'ml_project',
        array(
            'labels' => array(
                'name'          => __('Projects', 'mikroliving-theme'),
                'singular_name' => __('Project', 'mikroliving-theme'),
                'add_new_item'  => __('Add New Project', 'mikroliving-theme'),
                'edit_item'     => __('Edit Project', 'mikroliving-theme'),
            ),
            'public'       => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-building',
            'supports'     => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'has_archive'  => true,
            'rewrite'      => array('slug' => 'projects'),
        )
    );

    register_taxonomy(
        'ml_project_type',
        'ml_project',
        array(
            'labels'       => array(
                'name'          => __('Project Types', 'mikroliving-theme'),
                'singular_name' => __('Project Type', 'mikroliving-theme'),
            ),
            'public'       => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite'      => array('slug' => 'project-type'),
        )
    );

    register_post_type(
        'ml_service',
        array(
            'labels' => array(
                'name'          => __('Services', 'mikroliving-theme'),
                'singular_name' => __('Service', 'mikroliving-theme'),
                'add_new_item'  => __('Add New Service', 'mikroliving-theme'),
                'edit_item'     => __('Edit Service', 'mikroliving-theme'),
            ),
            'public'       => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-admin-tools',
            'supports'     => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'has_archive'  => true,
            'rewrite'      => array('slug' => 'services'),
        )
    );

    register_post_type(
        'ml_testimonial',
        array(
            'labels' => array(
                'name'          => __('Testimonials', 'mikroliving-theme'),
                'singular_name' => __('Testimonial', 'mikroliving-theme'),
                'add_new_item'  => __('Add New Testimonial', 'mikroliving-theme'),
                'edit_item'     => __('Edit Testimonial', 'mikroliving-theme'),
            ),
            'public'       => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-format-quote',
            'supports'     => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'has_archive'  => true,
            'rewrite'      => array('slug' => 'testimonials'),
        )
    );
}
add_action('init', 'mikroliving_register_content_types');

function mikroliving_register_meta()
{
    $meta_fields = array(
        'ml_project'     => array('location', 'area', 'project_label'),
        'ml_service'     => array('short_label'),
        'ml_testimonial' => array('client_role', 'rating'),
    );

    foreach ($meta_fields as $post_type => $fields) {
        foreach ($fields as $field) {
            register_post_meta(
                $post_type,
                $field,
                array(
                    'show_in_rest'      => true,
                    'single'            => true,
                    'type'              => $field === 'rating' ? 'number' : 'string',
                    'sanitize_callback' => $field === 'rating' ? 'absint' : 'sanitize_text_field',
                    'auth_callback'     => '__return_true',
                )
            );
        }
    }
}
add_action('init', 'mikroliving_register_meta');

function mikroliving_after_switch_theme()
{
    mikroliving_register_content_types();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'mikroliving_after_switch_theme');

function mikroliving_theme_option($key, $default = '')
{
    return get_theme_mod($key, $default);
}

function mikroliving_customize_register($wp_customize)
{
    $wp_customize->add_section(
        'mikroliving_homepage',
        array(
            'title'    => __('MikroLiving Homepage', 'mikroliving-theme'),
            'priority' => 30,
        )
    );

    $text_settings = array(
        'hero_badge'           => array('label' => 'Hero Badge', 'default' => 'Interior Design Studio'),
        'hero_title'           => array('label' => 'Hero Title', 'default' => 'Maximize Space, Simplify Life'),
        'hero_copy'            => array('label' => 'Hero Description', 'default' => 'MikroLiving helps modern families create warm, efficient, and beautifully functional interiors for compact homes and growing businesses.'),
        'hero_primary_label'   => array('label' => 'Primary Button Label', 'default' => 'View Portfolio'),
        'hero_primary_url'     => array('label' => 'Primary Button URL', 'default' => '#projects', 'sanitize' => 'esc_url_raw'),
        'hero_secondary_label' => array('label' => 'Secondary Button Label', 'default' => 'Explore Insights'),
        'hero_secondary_url'   => array('label' => 'Secondary Button URL', 'default' => '#insights', 'sanitize' => 'esc_url_raw'),
        'consultation_url'     => array('label' => 'Consultation URL', 'default' => '#contact', 'sanitize' => 'esc_url_raw'),
        'whatsapp_url'         => array('label' => 'WhatsApp URL', 'default' => 'https://wa.me/', 'sanitize' => 'esc_url_raw'),
        'studio_copy'          => array('label' => 'Studio Section Copy', 'default' => 'We shape compact interiors with thoughtful zoning, high-utility furniture, calm material palettes, and practical detailing that makes every square meter work harder.'),
        'footer_tagline'       => array('label' => 'Footer Tagline', 'default' => 'Interior design for smart, efficient, and warm daily living.'),
        'hero_stat_1_value'    => array('label' => 'Hero Stat 1 Value', 'default' => '150+'),
        'hero_stat_1_label'    => array('label' => 'Hero Stat 1 Label', 'default' => 'Projects'),
        'hero_stat_2_value'    => array('label' => 'Hero Stat 2 Value', 'default' => '98%'),
        'hero_stat_2_label'    => array('label' => 'Hero Stat 2 Label', 'default' => 'Client Satisfaction'),
        'hero_stat_3_value'    => array('label' => 'Hero Stat 3 Value', 'default' => '10+'),
        'hero_stat_3_label'    => array('label' => 'Hero Stat 3 Label', 'default' => 'Years Experience'),
        'studio_stat_1_value'  => array('label' => 'Studio Stat 1 Value', 'default' => '2014'),
        'studio_stat_1_label'  => array('label' => 'Studio Stat 1 Label', 'default' => 'Studio Founded'),
        'studio_stat_2_value'  => array('label' => 'Studio Stat 2 Value', 'default' => '3'),
        'studio_stat_2_label'  => array('label' => 'Studio Stat 2 Label', 'default' => 'Cities Active'),
        'studio_stat_3_value'  => array('label' => 'Studio Stat 3 Value', 'default' => '12'),
        'studio_stat_3_label'  => array('label' => 'Studio Stat 3 Label', 'default' => 'Design Awards'),
    );

    $priority = 10;

    foreach ($text_settings as $setting_key => $config) {
        $sanitize = isset($config['sanitize']) ? $config['sanitize'] : 'sanitize_text_field';

        $wp_customize->add_setting(
            $setting_key,
            array(
                'default'           => $config['default'],
                'sanitize_callback' => $sanitize,
            )
        );

        $wp_customize->add_control(
            $setting_key,
            array(
                'label'    => __($config['label'], 'mikroliving-theme'),
                'section'  => 'mikroliving_homepage',
                'type'     => 'text',
                'priority' => $priority,
            )
        );

        $priority += 5;
    }
}
add_action('customize_register', 'mikroliving_customize_register');

function mikroliving_primary_menu()
{
    wp_nav_menu(
        array(
            'theme_location' => 'primary',
            'container'      => false,
            'menu_class'     => 'site-menu',
            'fallback_cb'    => 'mikroliving_primary_menu_fallback',
        )
    );
}

function mikroliving_primary_menu_fallback()
{
    echo '<ul class="site-menu">';
    echo '<li><a href="' . esc_url(home_url('/#projects')) . '">Portfolio</a></li>';
    echo '<li><a href="' . esc_url(home_url('/#services')) . '">Services</a></li>';
    echo '<li><a href="' . esc_url(home_url('/#insights')) . '">Insights</a></li>';
    echo '<li><a href="' . esc_url(home_url('/blog')) . '">Blog</a></li>';
    echo '</ul>';
}

function mikroliving_logo_url()
{
    return get_template_directory_uri() . '/assets/images/logo.svg';
}

