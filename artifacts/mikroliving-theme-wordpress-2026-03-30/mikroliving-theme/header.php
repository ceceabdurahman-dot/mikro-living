<?php
if (! defined('ABSPATH')) {
    exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
    <div class="ml-container header-shell">
        <a class="site-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php esc_attr_e('MikroLiving home', 'mikroliving-theme'); ?>">
            <img src="<?php echo esc_url(mikroliving_logo_url()); ?>" alt="<?php esc_attr_e('MikroLiving', 'mikroliving-theme'); ?>">
        </a>
        <nav class="site-nav" aria-label="<?php esc_attr_e('Primary menu', 'mikroliving-theme'); ?>">
            <?php mikroliving_primary_menu(); ?>
        </nav>
        <a class="button button-primary header-cta" href="<?php echo esc_url(mikroliving_theme_option('consultation_url', '#contact')); ?>">
            <?php esc_html_e('Book Consultation', 'mikroliving-theme'); ?>
        </a>
    </div>
</header>
