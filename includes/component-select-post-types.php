<?php
namespace CoblocksExtended\SelectPostType;

add_action('rest_api_init', function () {
    register_rest_route('coblocks-extended/v1', '/post-types', array(
        'methods' => 'GET',
        'callback' => 'CoblocksExtended\\SelectPostType\\find_post_types',
    ));

    register_rest_route('coblocks-extended/v1', '/taxonomy-terms', array(
        'methods' => 'GET',
        'callback' => 'CoblocksExtended\\SelectPostType\\get_taxonomy_terms',
    ));
});

function find_post_types(\WP_REST_Request $request) {

    $cpts_query = array_keys(get_post_types([ 'public'   => true ]));
    $cpts = array(['value' => 'any', 'label' => 'Todos']);

    foreach($cpts_query as $cpt){
        $obj = get_post_type_object($cpt);

        $cpts[] = [
            'value' => $cpt,
            'label' => $obj->labels->singular_name,
            'has_featured' => is_taxonomy_assigned_to_post_type( $cpt, 'featured' )
        ];
    }

    return $cpts;
}

function get_taxonomy_terms(\WP_REST_Request $request){
    $return = array();

    $terms = [];
    $terms_query = get_terms([
        'taxonomy' => $_GET['slug'],
        'hide_empty' => false,
    ]);
    
    foreach ($terms_query as $term){
        $terms[] = [
            'count' => $term->count,
            'description' => $term->description,
            'id' => $term->term_id,
            'link' => get_term_link($term),
            'meta' => [],
            'name' => $term->name,
            'parent' => $term->parent,
            'slug' => $term->slug,
            'taxonomy'  => $_GET['slug'],
        ];
    }

    return new \WP_REST_Response($terms, 200);
}

function is_taxonomy_assigned_to_post_type( $post_type, $taxonomy = null ) {	
    if ( ! taxonomy_exists( $taxonomy ) ) 
        return false;
	if ( is_object( $post_type ) )
		$post_type = $post_type->post_type;
	if ( empty( $post_type ) )
		return false;
	$taxonomies = get_object_taxonomies( $post_type );
	if ( empty( $taxonomy ) )
		$taxonomy = get_query_var( 'taxonomy' );
	return in_array( $taxonomy, $taxonomies );
}

add_filter( 'rest_post_query', function( $args, $request ){
    if ( $request->get_param( 'taxonomy_terms' ) ) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => $request->get_param( 'taxonomy' ),
                'field'    => 'term_id',
                'terms'    => $request->get_param( 'taxonomy_terms' ),
            ),
        );
    }
    return $args;
}, 10, 2 );