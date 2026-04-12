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
                <article <?php post_class('page-article'); ?>>
                    <span class="section-kicker"><?php esc_html_e('Page', 'mikroliving-theme'); ?></span>
                    <h1><?php the_title(); ?></h1>
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
