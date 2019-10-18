<?php
namespace CoblocksExtended\AdvancedPosts;

/**
 * Server-side rendering of the `posts` block.
 *
 * @package WordPress
 */

/**
 * Renders the block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the block content.
 */


function render_block( $attributes ) {

	global $post;

	$args = array(
		'posts_per_page'   => $attributes['postsToShow'],
		'post_status'      => 'publish',
		'order'            => $attributes['order'],
		'orderby'          => $attributes['orderBy'],
		'suppress_filters' => false,
		'post__not_in'     => array( $post->ID ),
	);

	if(isset($attributes['selectedPosts'])){
		$args['post__in'] = array_map(function($p) {
			return $p['ID'];
		}, $attributes['selectedPosts']);
	}


	if ( isset( $attributes['categories'] ) ) {

		$args['category'] = $attributes['categories'];

	}

	if ( 'external' === $attributes['postFeedType'] && $attributes['externalRssUrl'] ) {

		$recent_posts = fetch_feed( $attributes['externalRssUrl'] );

		if ( is_wp_error( $recent_posts ) ) {

			return '<div class="components-placeholder"><div class="notice notice-error"><strong>' . __( 'RSS Error:', 'coblocks' ) . '</strong> ' . $recent_posts->get_error_message() . '</div></div>';

		}

		if ( ! $recent_posts->get_item_quantity() ) {

			// PHP 5.2 compatibility. See: http://simplepie.org/wiki/faq/i_m_getting_memory_leaks.
			$recent_posts->__destruct();

			unset( $recent_posts );

			return '<div class="components-placeholder"><div class="notice notice-error">' . __( 'An error has occurred, which probably means the feed is down. Try again later.', 'coblocks' ) . '</div></div>';

		}

		$recent_posts    = $recent_posts->get_items( 0, $attributes['postsToShow'] );
		$formatted_posts = coblocks_get_rss_post_info( $recent_posts );

	} else {

		$recent_posts    = get_posts( $args );
		$formatted_posts = coblocks_get_post_info( $recent_posts );

	}

	$block_style = null;

	if ( isset( $attributes['className'] ) && strpos( $attributes['className'], 'is-style-horizontal' ) !== false ) {

		$block_style = 'horizontal';

	} elseif ( isset( $attributes['className'] ) && strpos( $attributes['className'], 'is-style-stacked' ) !== false ) {

		$block_style = 'stacked';

	}

	return advanced_posts( $formatted_posts, $attributes );
}

/**
 * Renders the list and grid styles.
 *
 * @param array $posts Current posts.
 * @param array $attributes The block attributes.
 *
 * @return string Returns the block content for the list and grid styles.
 */
function advanced_posts( $posts, $attributes ) {
	$class       = '';
	$class_name  = '';
	$block_style = strpos( $attributes['className'], 'is-style-stacked' ) !== false ? 'stacked' : 'horizontal';

	if ( isset( $attributes['className'] ) ) {

		$class_name .= $attributes['className'];

	}

	if ( isset( $attributes['align'] ) ) {

		$class_name .= ' align' . $attributes['align'];

	}

	if ( isset( $attributes['columns'] ) ) {

		$class .= 'columns columns-' . $attributes['columns'];

	}

	$block_content = sprintf(
		'<div class="%1$s"><div class="%2$s list-none ml-0 pl-0 pt-3">',
		esc_attr( $class_name ),
		esc_attr( $class )
	);

	$list_items_markup = '';
	$list_items_class  = '';

	if ( 'horizontal' !== $block_style ) {

		$list_items_class .= 'flex-col';

	}

	foreach ( $posts as $post ) {

		$list_class       = '';
		$image_class      = '';
		$align_self_class = '';

		if ( isset( $attributes['listPosition'] ) && 'horizontal' === $block_style ) {

			if ( 'left' === $attributes['listPosition'] ) {

				$image_class .= ' mr-2 sm:mr-3';
			} else {

				$image_class     .= ' ml-3 sm:ml-3';
				$list_items_class = 'flex-row-reverse';

			}
		}

		if ( isset( $attributes['imageSize'] ) && 'horizontal' === $block_style ) {

			$image_class .= ' ' . $attributes['imageSize'];

		} else {

			$image_class .= 'w-full relative';

		}

		$list_items_markup .= sprintf(
			'<div class="flex flex-auto %1$s items-stretch w-full mt-0 mb-3 ml-0 pl-0">',
			$list_items_class
		);

		if ( null !== $post['thumbnailURL'] && $post['thumbnailURL'] ) {

			if ( 'stacked' === $block_style ) {

				$image_class .= ' mb-2';

			}

			$list_items_markup .= sprintf(
				'<div class="wp-block-coblocks-posts__image table flex-0 %1$s"><a href="%2$s" class="block w-full bg-cover bg-center-center pt-full" style="background-image:url(%3$s)"></a></div>',
				esc_attr( $image_class ),
				esc_url( $post['postLink'] ),
				esc_url( $post['thumbnailURL'] )
			);

			if ( 'horizontal' === $block_style && ( isset( $attributes['displayPostContent'] ) && ! $attributes['displayPostContent'] ) && ( isset( $attributes['columns'] ) && 2 >= $attributes['columns'] ) ) {

				$align_self_class = 'self-center';
			}
		} else {
			$align_self_class = 'flex-start';
		}

		$list_items_markup .= sprintf(
			'<div class="wp-block-coblocks-posts__content flex flex-col %s w-full">',
			esc_attr( $align_self_class )
		);

		if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] && 'stacked' === $block_style ) {

			$list_items_markup .= sprintf(
				'<time datetime="%1$s" class="wp-block-coblocks-posts__date mb-1">%2$s</time>',
				esc_url( $post['date'] ),
				esc_html( $post['dateReadable'] )
			);

		}

		$title = $post['title'];

		if ( ! $title ) {

			$title = _x( '(no title)', 'placeholder when a post has no title', 'coblocks' );

		}

		$list_items_markup .= sprintf(
			'<a href="%1$s" alt="%2$s">%2$s</a>',
			$post['postLink'],
			$title
		);

		if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] && 'horizontal' === $block_style ) {

			$list_items_markup .= sprintf(
				'<time datetime="%1$s" class="wp-block-coblocks-posts__date mt-2">%2$s</time>',
				esc_url( $post['date'] ),
				esc_html( $post['dateReadable'] )
			);

		}

		if ( isset( $attributes['displayPostContent'] ) && $attributes['displayPostContent'] ) {

			$post_excerpt    = $post['postExcerpt'];
			$trimmed_excerpt = esc_html( wp_trim_words( $post_excerpt, $attributes['excerptLength'], ' &hellip; ' ) );

			$list_items_markup .= sprintf(
				'<div class="wp-block-coblocks-posts__post-excerpt mt-1">%1$s</div>',
				esc_html( $trimmed_excerpt )
			);

		}

		if ( isset( $attributes['displayPostLink'] ) && $attributes['displayPostLink'] ) {

			$list_items_markup .= sprintf(
				'<div class="wp-block-coblocks-posts__more-link"><a href="%1$s">%2$s</a></div>',
				esc_url( $post['postLink'] ),
				esc_html( $attributes['postLink'] )
			);

		}

		$list_items_markup .= '</div></div>';

	}

	$block_content .= $list_items_markup;
	$block_content .= '</div>';
	$block_content .= '</div>';

	return $block_content;

}

/**
 * Registers the `posts` block on server.
 */
function register_block() {
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}

	\register_block_type(
		'coblocks/advanced-posts',
		array(
			'attributes'      => array(
				'className'          => array(
					'type' => 'string',
				),
				'align'              => array(
					'type' => 'string',
				),
				'postFeedType'       => array(
					'type'    => 'string',
					'default' => 'internal',
				),
				'externalRssUrl'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'postsToShow'        => array(
					'type'    => 'number',
					'default' => 2,
				),
				'displayPostContent' => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'displayPostDate'    => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'displayPostLink'    => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'postLink'           => array(
					'type'    => 'string',
					'default' => __( 'Read more', 'coblocks' ),
				),
				'excerptLength'      => array(
					'type'    => 'number',
					'default' => 12,
				),
				'imageSize'          => array(
					'type'    => 'string',
					'default' => 'w-1/7 sm:w-1/5 h-1/7 sm:h-1/5',
				),
				'listPosition'       => array(
					'type'    => 'string',
					'default' => 'right',
				),
				'columns'            => array(
					'type'    => 'number',
					'default' => 2,
				),
				'order'              => array(
					'type'    => 'string',
					'default' => 'desc',
				),
				'orderBy'            => array(
					'type'    => 'string',
					'default' => 'date',
				),
				'categories'         => array(
					'type' => 'string',
				),
				'selectedPosts'         => array(
					'type' => 'array',
					'items' => [
						'type' => 'object'
					],
					'default' => []
				),
				'offset' => array(
					'type' => 'string',
					'default' => '0'
				)
			),
			'render_callback' => 'CoblocksExtended\\AdvancedPosts\\render_block',
		)
	);
}
add_action( 'init', 'CoblocksExtended\\AdvancedPosts\\register_block' );
