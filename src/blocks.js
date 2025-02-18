/**
 * WordPress dependencies
 */
import {
	registerBlockType,
} from '@wordpress/blocks';

// Register block category
import './utils/block-category';

// Editor and Frontend Styles
import './styles/editor.scss';
import './styles/style.scss';

// Extensions
import './extensions/colors/inspector';
import './extensions/typography';
import './extensions/attributes';
import './extensions/advanced-controls';
import './extensions/list-styles';
import './extensions/button-styles';
import './extensions/button-controls';
import './extensions/image-styles';
import './extensions/cover-styles';
import './extensions/image-crop';

// Formats
import './formats';

// Block Gallery
import './components/block-gallery';

// Register Blocks
import * as accordion from './blocks/accordion';
import * as accordionItem from './blocks/accordion/accordion-item';
import * as alert from './blocks/alert';
import * as author from './blocks/author';
import * as buttons from './blocks/buttons';
import * as carousel from './blocks/gallery-carousel';
import * as clickToTweet from './blocks/click-to-tweet';
import * as collage from './blocks/gallery-collage';
import * as feature from './blocks/features/feature';
import * as features from './blocks/features';
import * as foodAndDrinks from './blocks/food-and-drinks';
import * as foodItem from './blocks/food-and-drinks/food-item';
import * as form from './blocks/form';
import * as fieldDate from './blocks/form/fields/date';
import * as fieldEmail from './blocks/form/fields/email';
import * as fieldName from './blocks/form/fields/name';
import * as fieldRadio from './blocks/form/fields/radio';
import * as fieldTelephone from './blocks/form/fields/phone';
import * as fieldTextarea from './blocks/form/fields/textarea';
import * as fieldSelect from './blocks/form/fields/select';
import * as fieldCheckbox from './blocks/form/fields/checkbox';
import * as fieldWebsite from './blocks/form/fields/website';
import * as fieldHidden from './blocks/form/fields/hidden';
import * as gif from './blocks/gif';
import * as gist from './blocks/gist';
import * as hero from './blocks/hero';
import * as highlight from './blocks/highlight';
import * as icon from './blocks/icon';
import * as logos from './blocks/logos';
import * as map from './blocks/map';
import * as masonry from './blocks/gallery-masonry';
import * as mediaCard from './blocks/media-card';
import * as postCarousel from './blocks/post-carousel';
import * as pricingTable from './blocks/pricing-table';
import * as pricingTableItem from './blocks/pricing-table/pricing-table-item';
import * as service from './blocks/services/service';
import * as services from './blocks/services';
import * as shapeDivider from './blocks/shape-divider';
import * as share from './blocks/share';
import * as socialProfiles from './blocks/social-profiles';
import * as stacked from './blocks/gallery-stacked';

import * as advancedPosts from './blocks/advanced-posts';


/**
 * Function to register an individual block.
 *
 * @param {Object} block The block to be registered.
 *
 */
const registerBlock = ( block ) => {
	if ( ! block ) {
		return;
	}

	const { name, category, settings } = block;

	registerBlockType( name, {
		category: category,
		...settings,
	} );
};

/**
 * Function to register blocks provided by CoBlocks.
 */
export const registerCoBlocksBlocks = () => {
	[
		accordion,
		accordionItem,
		alert,
		author,
		buttons,
		carousel,
		clickToTweet,
		collage,
		feature,
		features,
		fieldDate,
		fieldEmail,
		fieldName,
		fieldRadio,
		fieldTelephone,
		fieldTextarea,
		fieldSelect,
		fieldCheckbox,
		fieldWebsite,
		fieldHidden,
		foodAndDrinks,
		foodItem,
		form,
		gif,
		gist,
		hero,
		highlight,
		icon,
		logos,
		map,
		masonry,
		mediaCard,
		postCarousel,
		pricingTable,
		pricingTableItem,
		service,
		services,
		shapeDivider,
		share,
		socialProfiles,
		stacked,
		advancedPosts,
	].forEach( registerBlock );
};

registerCoBlocksBlocks();
