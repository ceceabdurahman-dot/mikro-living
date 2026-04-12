<?php
if (! defined('ABSPATH')) {
    exit;
}

function mikroliving_rest_request($route, $params = array())
{
    if (! class_exists('WP_REST_Request')) {
        return array();
    }

    $request = new WP_REST_Request('GET', '/' . ltrim($route, '/'));

    foreach ($params as $key => $value) {
        if ($value !== '' && $value !== null) {
            $request->set_param($key, $value);
        }
    }

    if (! isset($params['_embed'])) {
        $request->set_param('_embed', 1);
    }

    $response = rest_do_request($request);

    if (is_wp_error($response) || $response->is_error()) {
        return array();
    }

    $data = $response->get_data();

    return is_array($data) ? $data : array();
}

function mikroliving_item_meta($item, $key, $default = '')
{
    if (isset($item['meta']) && is_array($item['meta']) && isset($item['meta'][$key]) && $item['meta'][$key] !== '') {
        return $item['meta'][$key];
    }

    return $default;
}

function mikroliving_item_title($item, $default = '')
{
    return isset($item['title']['rendered']) ? wp_strip_all_tags($item['title']['rendered']) : $default;
}

function mikroliving_item_excerpt($item, $default = '')
{
    if (! empty($item['excerpt']['rendered'])) {
        return wp_strip_all_tags($item['excerpt']['rendered']);
    }

    if (! empty($item['content']['rendered'])) {
        return wp_trim_words(wp_strip_all_tags($item['content']['rendered']), 22);
    }

    return $default;
}

function mikroliving_item_image($item, $fallback = '')
{
    if (! empty($item['_embedded']['wp:featuredmedia'][0]['source_url'])) {
        return $item['_embedded']['wp:featuredmedia'][0]['source_url'];
    }

    return $fallback;
}

function mikroliving_get_projects($limit = 4)
{
    return mikroliving_rest_request(
        '/wp/v2/ml_project',
        array(
            'per_page' => $limit,
            'status'   => 'publish',
            'orderby'  => 'date',
            'order'    => 'desc',
        )
    );
}

function mikroliving_get_services($limit = 6)
{
    return mikroliving_rest_request(
        '/wp/v2/ml_service',
        array(
            'per_page' => $limit,
            'status'   => 'publish',
            'orderby'  => 'menu_order',
            'order'    => 'asc',
        )
    );
}

function mikroliving_get_testimonials($limit = 3)
{
    return mikroliving_rest_request(
        '/wp/v2/ml_testimonial',
        array(
            'per_page' => $limit,
            'status'   => 'publish',
            'orderby'  => 'date',
            'order'    => 'desc',
        )
    );
}

function mikroliving_get_latest_posts($limit = 3)
{
    return mikroliving_rest_request(
        '/wp/v2/posts',
        array(
            'per_page' => $limit,
            'status'   => 'publish',
            'orderby'  => 'date',
            'order'    => 'desc',
        )
    );
}
