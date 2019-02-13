/**
 * External dependencies
 */
import classnames from 'classnames';
import memoize from 'memize';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import Inspector from './inspector';
// import Controls from './controls';

/**
 * WordPress dependencies
 */
const { __, _x } = wp.i18n;
const { compose } = wp.compose;
const { Component, Fragment } = wp.element;
const { InnerBlocks } = wp.editor;
const { Spinner } = wp.components;

/**
 * Constants
 */

/**
 * Allowed blocks and template constant is passed to InnerBlocks precisely as specified here.
 * The contents of the array should never change.
 * The array should contain the name of each block that is allowed.
 * In standout block, the only block we allow is 'core/list'.
 *
 * @constant
 * @type {string[]}
*/
const ALLOWED_BLOCKS = [ 'core/heading', 'core/paragraph', 'core/spacer', 'core/button', 'core/list', 'core/image', 'coblocks/alert', 'coblocks/gif', 'coblocks/social', 'coblocks/row' , 'coblocks/column', 'coblocks/buttons' ];

const getTemplate = memoize( ( props ) => {
	let template = [
		[ 'coblocks/row', { columns: 1, align: 'full', layout: '100', paddingSize: 'advanced', paddingUnit: '%', paddingTop: 8, paddingRight: 40, paddingBottom: 8, paddingLeft: 8, hasMarginControl: false, hasStackedControl: false, hasAlignmentControls: false, customBackgroundColor: '#f4e9e0' }, [
	        [ 'coblocks/column', { width: "100" },
	        	[
	        		[ 'core/heading', { placeholder: _x( 'Add heading...', 'content placeholder' ), content: _x( 'Hero Block', 'content placeholder' ) , level: 2 } ],
					[ 'core/paragraph', { placeholder: _x( 'Add content...', 'content placeholder' ), content: _x( 'An introductory area of a page accompanied by a small amount of text and a call to action.', 'content placeholder' ) } ],
					[ 'coblocks/buttons', { contentAlign: 'left', items: 2, gutter: 'medium' }],
	        	]
	        ],
	    ] ],
	];

	return template;
} );

/**
 * Block edit function
 */
class Edit extends Component {

	constructor( props ) {
		super( ...arguments );
	}

	render() {

		const {
			clientId,
			attributes,
			className,
			isSelected,
			setAttributes,
		} = this.props;

		const {
			layout,
		} = attributes;

		const classes = classnames(
			className, {
			}
		);

		const innerClasses = classnames(
			'wp-block-coblocks-hero__inner',{
				[ `hero-${ layout }-align` ] : layout,
			}
		);

		const innerStyles = {
			// textAlign: contentAlign ? contentAlign : undefined
		};
		return [
			<Fragment>
				{ isSelected && (
					<Inspector
						{ ...this.props }
					/>
				) }
				<div
					className={ classnames(
						className, {
							
						}
					) }
				>
					<div className={ innerClasses } style={ innerStyles } >
						{ ( typeof this.props.insertBlocksAfter !== 'undefined' ) && (
							<InnerBlocks
								template={ getTemplate( this.props ) }
								allowedBlocks={ ALLOWED_BLOCKS }
								templateLock="all"
								templateInsertUpdatesSelection={ false }
							/>
						) }
					</div>
				</div>
			</Fragment>
		];
	}
}

export default compose( [
	// applyWithColors,
] )( Edit );
