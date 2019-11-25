/**
 * WordPress dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import brandAssets from './brand-assets';

setCategories( [
	{
		slug: 'coblocks',
		title: 'CoBlocks',
		icon: brandAssets.categoryIcon,
	},
	{
		slug: 'coblocks-galleries',
		title: sprintf(
			/* translators: %s: Plugin title "CoBlocks" */
			__( '%s Galleries', 'coblocks' ),
			'CoBlocks'
		),
		icon: brandAssets.categoryIcon,
	},
	{
		slug: 'coblocks-extended',
		/* translators: %s: Plugin title, i.e. CoBlocks */
		title: sprintf( __( '%s Extended', 'coblocks' ), 'CoBlocks' ),
		icon: brandAssets.categoryIcon,
	},
	...getCategories().filter( ( { slug } ) => (slug !== 'coblocks-galleries' && slug !== 'coblocks-extended') ),
] );
