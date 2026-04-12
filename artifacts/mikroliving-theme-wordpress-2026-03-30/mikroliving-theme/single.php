<?php
if (! defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="site-main">
    <section class="section">
        <div class="ml-container prose-shell">
            <?php while (have_posts()) : the_post(); ?>
                <article <?php post_class('single-article'); ?>>
                    <span class="section-kicker"><?php echo esc_html(get_post_type_object(get_post_type())->labels->singular_name ?? __('Article', 'mikroliving-theme')); ?></span>
                    <h1><?php the_title(); ?></h1>
                    <?php if (has_post_thumbnail()) : ?>
                        <div class="single-media">
                            <?php the_post_thumbnail('large'); ?>
                        </div>
                    <?php endif; ?>
                    <div class="rich-content">
                        <?php the_content(); ?>
                    </div>
                </article>
            <?php endwhile; ?>
        </div>
    </section>
</main>
<?php
get_footer();
