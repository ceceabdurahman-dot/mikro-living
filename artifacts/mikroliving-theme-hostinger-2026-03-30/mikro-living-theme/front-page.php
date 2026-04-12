<?php
if (! defined('ABSPATH')) {
    exit;
}

$projects     = mikroliving_get_projects(4);
$services     = mikroliving_get_services(6);
$testimonials = mikroliving_get_testimonials(1);
$posts        = mikroliving_get_latest_posts(3);

$hero_stats = array(
    array(
        'value' => mikroliving_theme_option('hero_stat_1_value', '150+'),
        'label' => mikroliving_theme_option('hero_stat_1_label', 'Projects'),
    ),
    array(
        'value' => mikroliving_theme_option('hero_stat_2_value', '98%'),
        'label' => mikroliving_theme_option('hero_stat_2_label', 'Client Satisfaction'),
    ),
    array(
        'value' => mikroliving_theme_option('hero_stat_3_value', '10+'),
        'label' => mikroliving_theme_option('hero_stat_3_label', 'Years Experience'),
    ),
);

$studio_stats = array(
    array(
        'value' => mikroliving_theme_option('studio_stat_1_value', '2014'),
        'label' => mikroliving_theme_option('studio_stat_1_label', 'Studio Founded'),
    ),
    array(
        'value' => mikroliving_theme_option('studio_stat_2_value', '3'),
        'label' => mikroliving_theme_option('studio_stat_2_label', 'Cities Active'),
    ),
    array(
        'value' => mikroliving_theme_option('studio_stat_3_value', '12'),
        'label' => mikroliving_theme_option('studio_stat_3_label', 'Design Awards'),
    ),
);

get_header();
?>
<main class="site-main">
    <section class="hero-section">
        <div class="ml-container hero-grid">
            <div class="hero-copy">
                <span class="eyebrow"><?php echo esc_html(mikroliving_theme_option('hero_badge', 'Interior Design Studio')); ?></span>
                <h1><?php echo esc_html(mikroliving_theme_option('hero_title', 'Maximize Space, Simplify Life')); ?></h1>
                <p><?php echo esc_html(mikroliving_theme_option('hero_copy', 'MikroLiving helps modern families create warm, efficient, and beautifully functional interiors for compact homes and growing businesses.')); ?></p>
                <div class="hero-actions">
                    <a class="button button-primary" href="<?php echo esc_url(mikroliving_theme_option('hero_primary_url', '#projects')); ?>">
                        <?php echo esc_html(mikroliving_theme_option('hero_primary_label', 'View Portfolio')); ?>
                    </a>
                    <a class="button button-secondary" href="<?php echo esc_url(mikroliving_theme_option('hero_secondary_url', '#insights')); ?>">
                        <?php echo esc_html(mikroliving_theme_option('hero_secondary_label', 'Explore Insights')); ?>
                    </a>
                </div>
                <div class="stats-row">
                    <?php foreach ($hero_stats as $stat) : ?>
                        <div class="stat-card">
                            <strong><?php echo esc_html($stat['value']); ?></strong>
                            <span><?php echo esc_html($stat['label']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <div class="hero-panel">
                <div class="hero-panel-card">
                    <p class="panel-label"><?php esc_html_e('Ready for a smarter layout?', 'mikroliving-theme'); ?></p>
                    <p class="panel-copy"><?php esc_html_e('This theme is wired to WordPress REST endpoints, so your homepage updates directly from WordPress content without rebuilding a separate frontend app.', 'mikroliving-theme'); ?></p>
                    <a class="button button-ghost" href="<?php echo esc_url(mikroliving_theme_option('consultation_url', '#contact')); ?>">
                        <?php esc_html_e('Book Consultation', 'mikroliving-theme'); ?>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section class="section section-muted">
        <div class="ml-container two-column">
            <div>
                <span class="section-kicker"><?php esc_html_e('Studio', 'mikroliving-theme'); ?></span>
                <h2><?php esc_html_e('Compact-first design thinking for everyday comfort', 'mikroliving-theme'); ?></h2>
            </div>
            <div>
                <p><?php echo esc_html(mikroliving_theme_option('studio_copy', 'We shape compact interiors with thoughtful zoning, high-utility furniture, calm material palettes, and practical detailing that makes every square meter work harder.')); ?></p>
                <div class="stats-row compact">
                    <?php foreach ($studio_stats as $stat) : ?>
                        <div class="stat-card">
                            <strong><?php echo esc_html($stat['value']); ?></strong>
                            <span><?php echo esc_html($stat['label']); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="projects">
        <div class="ml-container">
            <div class="section-head">
                <div>
                    <span class="section-kicker"><?php esc_html_e('Signature Projects', 'mikroliving-theme'); ?></span>
                    <h2><?php esc_html_e('Portfolio fed from WordPress REST API', 'mikroliving-theme'); ?></h2>
                </div>
                <a class="text-link" href="<?php echo esc_url(get_post_type_archive_link('ml_project')); ?>"><?php esc_html_e('View all projects', 'mikroliving-theme'); ?></a>
            </div>
            <div class="cards-grid cards-grid-projects">
                <?php if (! empty($projects)) : ?>
                    <?php foreach ($projects as $project) : ?>
                        <?php
                        $project_image = mikroliving_item_image($project);
                        $project_url   = ! empty($project['link']) ? $project['link'] : '#';
                        ?>
                        <article class="content-card project-card">
                            <?php if ($project_image) : ?>
                                <img class="card-media" src="<?php echo esc_url($project_image); ?>" alt="<?php echo esc_attr(mikroliving_item_title($project, 'Project')); ?>">
                            <?php endif; ?>
                            <div class="card-body">
                                <div class="card-meta-row">
                                    <span><?php echo esc_html(mikroliving_item_meta($project, 'project_label', 'Interior Project')); ?></span>
                                    <span><?php echo esc_html(mikroliving_item_meta($project, 'location', 'Indonesia')); ?></span>
                                </div>
                                <h3><?php echo esc_html(mikroliving_item_title($project, 'Untitled Project')); ?></h3>
                                <p><?php echo esc_html(mikroliving_item_excerpt($project, 'Add project content in WordPress to populate this section.')); ?></p>
                                <div class="card-footer">
                                    <span><?php echo esc_html(mikroliving_item_meta($project, 'area', 'Custom area')); ?></span>
                                    <a href="<?php echo esc_url($project_url); ?>"><?php esc_html_e('Open project', 'mikroliving-theme'); ?></a>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php else : ?>
                    <article class="empty-card">
                        <h3><?php esc_html_e('No projects published yet', 'mikroliving-theme'); ?></h3>
                        <p><?php esc_html_e('Create a few items under Projects in WordPress Admin and they will appear here automatically through the built-in REST API.', 'mikroliving-theme'); ?></p>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <section class="section section-muted" id="services">
        <div class="ml-container">
            <div class="section-head">
                <div>
                    <span class="section-kicker"><?php esc_html_e('Services', 'mikroliving-theme'); ?></span>
                    <h2><?php esc_html_e('A compact service menu ready for Hostinger deployment', 'mikroliving-theme'); ?></h2>
                </div>
            </div>
            <div class="cards-grid cards-grid-services">
                <?php if (! empty($services)) : ?>
                    <?php foreach ($services as $service) : ?>
                        <article class="content-card service-card">
                            <div class="service-pill"><?php echo esc_html(mikroliving_item_meta($service, 'short_label', 'ML')); ?></div>
                            <h3><?php echo esc_html(mikroliving_item_title($service, 'Service')); ?></h3>
                            <p><?php echo esc_html(mikroliving_item_excerpt($service, 'Add a service description from WordPress to describe this offer.')); ?></p>
                        </article>
                    <?php endforeach; ?>
                <?php else : ?>
                    <article class="empty-card">
                        <h3><?php esc_html_e('No services published yet', 'mikroliving-theme'); ?></h3>
                        <p><?php esc_html_e('Create service entries in WordPress Admin to populate this grid through the wp/v2/ml_service endpoint.', 'mikroliving-theme'); ?></p>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="ml-container testimonial-shell">
            <?php if (! empty($testimonials)) : ?>
                <?php $testimonial = $testimonials[0]; ?>
                <span class="section-kicker"><?php esc_html_e('Client Voice', 'mikroliving-theme'); ?></span>
                <blockquote class="testimonial-card">
                    <p><?php echo esc_html(mikroliving_item_excerpt($testimonial, 'Publish a testimonial post type entry to replace this quote.')); ?></p>
                    <footer>
                        <strong><?php echo esc_html(mikroliving_item_title($testimonial, 'MikroLiving Client')); ?></strong>
                        <span><?php echo esc_html(mikroliving_item_meta($testimonial, 'client_role', 'Homeowner')); ?></span>
                    </footer>
                </blockquote>
            <?php else : ?>
                <div class="empty-card">
                    <h3><?php esc_html_e('Testimonials are empty', 'mikroliving-theme'); ?></h3>
                    <p><?php esc_html_e('Add a testimonial in WordPress Admin to fill this spotlight section.', 'mikroliving-theme'); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="section section-muted" id="insights">
        <div class="ml-container">
            <div class="section-head">
                <div>
                    <span class="section-kicker"><?php esc_html_e('Latest Insights', 'mikroliving-theme'); ?></span>
                    <h2><?php esc_html_e('Posts loaded from the default WordPress posts endpoint', 'mikroliving-theme'); ?></h2>
                </div>
                <a class="text-link" href="<?php echo esc_url(get_permalink(get_option('page_for_posts')) ?: get_post_type_archive_link('post')); ?>"><?php esc_html_e('Visit blog', 'mikroliving-theme'); ?></a>
            </div>
            <div class="cards-grid cards-grid-posts">
                <?php if (! empty($posts)) : ?>
                    <?php foreach ($posts as $post_item) : ?>
                        <?php $post_image = mikroliving_item_image($post_item); ?>
                        <article class="content-card post-card">
                            <?php if ($post_image) : ?>
                                <img class="card-media" src="<?php echo esc_url($post_image); ?>" alt="<?php echo esc_attr(mikroliving_item_title($post_item, 'Post')); ?>">
                            <?php endif; ?>
                            <div class="card-body">
                                <span class="pill"><?php echo esc_html(get_the_date('', $post_item['id'])); ?></span>
                                <h3><?php echo esc_html(mikroliving_item_title($post_item, 'Untitled Post')); ?></h3>
                                <p><?php echo esc_html(mikroliving_item_excerpt($post_item, 'Write a blog post in WordPress to populate this card.')); ?></p>
                                <a href="<?php echo esc_url($post_item['link']); ?>"><?php esc_html_e('Read article', 'mikroliving-theme'); ?></a>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php else : ?>
                    <article class="empty-card">
                        <h3><?php esc_html_e('No blog posts yet', 'mikroliving-theme'); ?></h3>
                        <p><?php esc_html_e('Section ini otomatis mengambil artikel dari endpoint bawaan WordPress wp/v2/posts.', 'mikroliving-theme'); ?></p>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>
<?php
get_footer();
