<?php
if (! defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="site-main">
    <section class="section">
        <div class="ml-container">
            <div class="section-head">
                <div>
                    <span class="section-kicker"><?php esc_html_e('Archive', 'mikroliving-theme'); ?></span>
                    <h1><?php the_archive_title(); ?></h1>
                </div>
                <?php if (get_the_archive_description()) : ?>
                    <p class="archive-description"><?php echo wp_kses_post(get_the_archive_description()); ?></p>
                <?php endif; ?>
            </div>
            <?php if (have_posts()) : ?>
                <div class="cards-grid cards-grid-projects">
                    <?php while (have_posts()) : the_post(); ?>
                        <article <?php post_class('content-card post-card'); ?>>
                            <?php if (has_post_thumbnail()) : ?>
                                <a href="<?php the_permalink(); ?>" class="card-media-link"><?php the_post_thumbnail('medium_large', array('class' => 'card-media')); ?></a>
                            <?php endif; ?>
                            <div class="card-body">
                                <span class="pill"><?php echo esc_html(get_post_type_object(get_post_type())->labels->singular_name ?? __('Content', 'mikroliving-theme')); ?></span>
                                <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                                <p><?php echo esc_html(get_the_excerpt()); ?></p>
                                <a href="<?php the_permalink(); ?>"><?php esc_html_e('Read more', 'mikroliving-theme'); ?></a>
                            </div>
                        </article>
                    <?php endwhile; ?>
                </div>
                <?php the_posts_pagination(); ?>
            <?php else : ?>
                <article class="empty-card">
                    <h2><?php esc_html_e('No items published yet', 'mikroliving-theme'); ?></h2>
                    <p><?php esc_html_e('Publish new content in WordPress to populate this archive.', 'mikroliving-theme'); ?></p>
                </article>
            <?php endif; ?>
        </div>
    </section>
</main>
<?php
get_footer();
