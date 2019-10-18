<?php
namespace CoblocksExtended\SelectPosts;

add_filter( 'posts_where', 'CoblocksExtended\\SelectPosts\\posts_where', 10, 2 );
function posts_where( $where, $wp_query )
{
    global $wpdb;
    if ( $title = $wp_query->get( 'title_like' ) ) {
        $where .= ' AND ' . $wpdb->posts . '.post_title LIKE \'%' . esc_sql( $wpdb->esc_like( $title ) ) . '%\'';
    }
    return $where;
}


add_action('rest_api_init', function () {
    register_rest_route('coblocks-extended/v1', '/posts-by-title', array(
        'methods' => 'GET',
        'callback' => 'CoblocksExtended\\SelectPosts\\find_posts',
    ));
});

function find_posts(\WP_REST_Request $request) {
    global $post;
    // You can access parameters via direct array access on the object:

    $posts = [];
    $aqc_posts = new \WP_Query([
        'posts_per_page' => '24',
        'title_like' => $_GET['title'],
        'post_type' =>  $_GET['post_type'],
        'post_status' => 'publish'
    ]);

    if($aqc_posts->have_posts() ) {
        while ($aqc_posts->have_posts() ) {
            $aqc_posts->the_post();
            $prepared_post = coblocks_get_post_info([$post])[0];
            $prepared_post['ID'] = get_the_ID();
            $posts[] = $prepared_post;
        }
    }

    return [
        'count' => $aqc_posts->found_posts,
        'posts' => $posts,
    ];

}
