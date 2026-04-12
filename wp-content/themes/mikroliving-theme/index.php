<?php
if (! defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="site-main">
    <section class="section">
        <div class="ml-container prose-shell">
            <span class="section-kicker"><?php esc_html_e('Content', 'mikroliving-theme'); ?></span>
            <h1><?php bloginfo('name'); ?></h1>
            <?php if (have_posts()) : ?>
                <div class="archive-stack">
                    <?php while (have_posts()) : the_post(); ?>
                        <article <?php post_class('archive-card'); ?>>
                            <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                            <p><?php echo esc_html(get_the_excerpt()); ?></p>
                        </article>
                    <?php endwhile; ?>
                </div>
                <?php the_posts_pagination(); ?>
            <?php else : ?>
                <article class="empty-card">
                    <h2><?php esc_html_e('No content found', 'mikroliving-theme'); ?></h2>
                    <p><?php esc_html_e('Add content in WordPress Admin and it will show here.', 'mikroliving-theme'); ?></p>
                </article>
            <?php endif; ?>
        </div>
    </section>
</main>
<?php
get_footer();
