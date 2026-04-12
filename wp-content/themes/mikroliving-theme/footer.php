<?php
if (! defined('ABSPATH')) {
    exit;
}
?>
<footer class="site-footer" id="contact">
    <div class="ml-container footer-grid">
        <div>
            <img class="footer-logo" src="<?php echo esc_url(mikroliving_logo_url()); ?>" alt="<?php esc_attr_e('MikroLiving', 'mikroliving-theme'); ?>">
            <p class="footer-copy"><?php echo esc_html(mikroliving_theme_option('footer_tagline', 'Interior design for smart, efficient, and warm daily living.')); ?></p>
        </div>
        <div>
            <p class="footer-heading"><?php esc_html_e('Quick Links', 'mikroliving-theme'); ?></p>
            <ul class="footer-links">
                <li><a href="<?php echo esc_url(home_url('/#projects')); ?>"><?php esc_html_e('Portfolio', 'mikroliving-theme'); ?></a></li>
                <li><a href="<?php echo esc_url(home_url('/#services')); ?>"><?php esc_html_e('Services', 'mikroliving-theme'); ?></a></li>
                <li><a href="<?php echo esc_url(home_url('/blog')); ?>"><?php esc_html_e('Blog', 'mikroliving-theme'); ?></a></li>
            </ul>
        </div>
        <div>
            <p class="footer-heading"><?php esc_html_e('Connect', 'mikroliving-theme'); ?></p>
            <ul class="footer-links">
                <li><a href="<?php echo esc_url(mikroliving_theme_option('consultation_url', '#contact')); ?>"><?php esc_html_e('Book Consultation', 'mikroliving-theme'); ?></a></li>
                <li><a href="<?php echo esc_url(mikroliving_theme_option('whatsapp_url', 'https://wa.me/')); ?>"><?php esc_html_e('WhatsApp', 'mikroliving-theme'); ?></a></li>
                <li><a href="<?php echo esc_url(admin_url()); ?>"><?php esc_html_e('WordPress Admin', 'mikroliving-theme'); ?></a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="ml-container footer-bottom-row">
            <span><?php echo esc_html(date_i18n('Y')); ?> MikroLiving</span>
            <span><?php esc_html_e('Built as a WordPress theme powered by the WordPress REST API.', 'mikroliving-theme'); ?></span>
        </div>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
