<?php
namespace CoblocksExtended\SelectPostType;

add_action('rest_api_init', function () {
    register_rest_route('coblocks-extended/v1', '/post-types', array(
        'methods' => 'GET',
        'callback' => 'CoblocksExtended\\SelectPostType\\find_post_types',
    ));
});

function find_post_types(\WP_REST_Request $request) {

    $cpts_query = array_keys(get_post_types([ 'public'   => true ]));
    $cpts = array(['value' => 'any', 'label' => 'Todos']);

    foreach($cpts_query as $cpt){
        $obj = get_post_type_object($cpt);

        $cpts[] = [
            'value' => $cpt,
            'label' => $obj->labels->singular_name    
        ];
    }

    return $cpts;
}
