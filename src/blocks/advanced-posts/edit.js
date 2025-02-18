/**
 * External dependencies
 */
import classnames from 'classnames';
import includes from 'lodash/includes';
import { find, isUndefined, pickBy, some } from 'lodash';

/**
 * Internal dependencies
 */

import InspectorControls from './inspector';
import icons from './icons';
import icon from './icon';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, _x, sprintf } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { Component, RawHTML, Fragment } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import { dateI18n, format, __experimentalGetSettings } from '@wordpress/date';
import { withSelect } from '@wordpress/data';
import { BlockControls, RichText, BlockIcon } from '@wordpress/block-editor';
import {
	Placeholder,
	Spinner,
	Toolbar,
	TextControl,
	Button,
	Disabled,
	ServerSideRender,
} from '@wordpress/components';

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};

const TokenList = wp.tokenList;

const styleOptions = [
	{
		name: 'stacked',
		label: _x( 'Stacked', 'block style', 'coblocks' ),
		icon: icons.styleStacked,
		isDefault: true,
	},
	{
		name: 'horizontal',
		label: _x( 'Horizontal', 'block style', 'coblocks' ),
		icon: icons.styleHorizontalImageRight,
		iconAlt: icons.styleHorizontalImageLeft,
	},
	{
		name: 'featured',
		label: _x( 'Em destaque', 'block style' ),
		icon: icons.styleFeatured,
	},
];

/**
 * Returns the active style from the given className.
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
 * @return {Object?} The active style.
 */
function getActiveStyle( styles, className ) {
	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );

		if ( activeStyle ) {
			return activeStyle;
		}
	}

	return find( styles, 'isDefault' );
}

/**
 * Replaces the active style in the block's className.
 *
 * @param {string}  className   Class name.
 * @param {Object?} activeStyle The replaced style.
 * @param {Object}  newStyle    The replacing style.
 *
 * @return {string} The updated className.
 */
function replaceActiveStyle( className, activeStyle, newStyle ) {
	const list = new TokenList( className );

	if ( activeStyle ) {
		list.remove( 'is-style-' + activeStyle.name );
	}

	list.add( 'is-style-' + newStyle.name );

	return list.value;
}

class AdvancedPostsEdit extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			categoriesList: [],
			featuredList: [],
			postTypeList: [],
			editing: ! this.props.attributes.externalRssUrl,
			lastColumnValue: null,

			stackedDefaultColumns: 2,
			horizontalDefaultColumns: 1,
			userModifiedColumn: false,
		};

		if (
			( this.props.className.includes( 'is-style-stacked' ) && this.props.attributes.columns !== this.state.stackedDefaultColumns ) ||
			( this.props.className.includes( 'is-style-horizontal' ) && this.props.attributes.columns !== this.state.horizontalDefaultColumns )
		) {
			this.state.userModifiedColumn = true;
		}

		this.onUserModifiedColumn = this.onUserModifiedColumn.bind( this );
		this.onSubmitURL = this.onSubmitURL.bind( this );
		this.updateStyle = this.updateStyle.bind( this );
	}

	componentDidMount() {
		const { className } = this.props;
		const activeStyle = getActiveStyle( styleOptions, className );

		this.updateStyle( activeStyle );

		this.isStillMounted = true;
		this.fetchRequest = apiFetch( {
			path: addQueryArgs( '/wp-json/wp/v2/categories', CATEGORIES_LIST_QUERY ),
		} ).then(
			( categoriesList ) => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList } );
				}
			}
		).catch(
			() => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList: [] } );
				}
			}
		);

		this.fetchRequest = apiFetch( {
			path: addQueryArgs( '/wp-json/coblocks-extended/v1/taxonomy-terms', { slug : 'featured' } ),
		} ).then(
			( featuredList ) => {
				if ( this.isStillMounted ) {
					this.setState( { featuredList } );
				}
			}
		).catch( () => {
				if ( this.isStillMounted ) {
					this.setState( { featuredList: [] } );
				}
			}
		);

		this.fetchRequest = apiFetch( {
			path: addQueryArgs( '/wp-json/coblocks-extended/v1/post-types', { } ),
		} ).then( ( postTypeList ) => {
				if ( this.isStillMounted ) {
					this.setState( { postTypeList } );
				}
			}
		).catch( () => {
				if ( this.isStillMounted ) {
					this.setState( { postTypeList: [] } );
				}
			}
		);
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	componentDidUpdate( prevProps ) {
		const { displayPostContent, displayPostLink } = this.props.attributes;
		if ( displayPostLink && ! displayPostContent ) {
			this.props.setAttributes( {
				displayPostLink: false,
			} );
		}

		if ( this.props.className !== prevProps.className ) {
			if ( this.props.className.includes( 'is-style-stacked' ) || this.props.className.includes( 'is-style-featured' ) ) {
				this.props.setAttributes( { columns: this.state.userModifiedColumn ? this.props.attributes.columns : this.state.stackedDefaultColumns } );
			}

			if ( this.props.className.includes( 'is-style-horizontal' ) ) {
				this.props.setAttributes( { columns: this.state.userModifiedColumn ? this.props.attributes.columns : this.state.horizontalDefaultColumns } );
			}
		}
	}

	onUserModifiedColumn() {
		this.setState( { userModifiedColumn: true } );
	}

	onSubmitURL( event ) {
		event.preventDefault();

		const { externalRssUrl } = this.props.attributes;
		if ( externalRssUrl ) {
			this.setState( { editing: false } );
		}
	}

	updateStyle( style ) {
		const { className, setAttributes, attributes } = this.props;

		const activeStyle = getActiveStyle( styleOptions, className );

		let updatedClassName = replaceActiveStyle(
			className,
			activeStyle,
			style
		);

		updatedClassName = updatedClassName.replace('display-first-post-image', '')
		setAttributes( { className: `${updatedClassName} ${ attributes.displayFirstPostImage ? 'display-first-post-image' : '' } ` } );
	}

	render() {
		const {
			attributes,
			setAttributes,
			className,
			latestPosts,
		} = this.props;

		const { categoriesList, featuredList, postTypeList } = this.state;

		const isHorizontalStyle = includes( className, 'is-style-horizontal' );
		const isStackedStyle = includes( className, 'is-style-stacked' );
		const isFeaturedStyle = includes( className, 'is-style-featured' );

		const activeStyle = getActiveStyle( styleOptions, className );

		const {
			displayPostContent,
			displayPostDate,
			displayPostLink,
			displayFirstPostImage,
			displayThumbnail,
			displayCategory,
			postLink,
			postFeedType,
			externalRssUrl,
			columns,
			postsToShow,
			excerptLength,
			listPosition,
			imageSize,
			selectedPosts,
			offset,
		} = attributes;

		const imageClasses = classnames( 'wp-block-coblocks-posts__image', 'table', 'flex-0', 'relative', {
			'mr-3': isHorizontalStyle && listPosition === 'left',
			'mb-2': isStackedStyle || isFeaturedStyle,
			'ml-3': isHorizontalStyle && listPosition === 'right',
			'w-full': isStackedStyle || isFeaturedStyle,
			[ imageSize ]: isHorizontalStyle,
			'hidden' : !displayThumbnail
		} );

		const editToolbarControls = [
			{
				icon: 'edit',
				title: __( 'Edit RSS URL', 'coblocks' ),
				onClick: () => this.setState( { editing: true } ),
			},
		];

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;

		const displayPosts = Array.isArray( latestPosts ) && latestPosts.length > postsToShow ? latestPosts.slice( 0, postsToShow ) : latestPosts;

		const hasFeaturedImage = some( displayPosts, 'featured_media_object' );

		const toolbarControls = [ {
			icon: icons.imageLeft,
			title: __( 'Image on left', 'coblocks' ),
			isActive: listPosition === 'left',
			onClick: () => setAttributes( { listPosition: 'left' } ),
		}, {
			icon: icons.imageRight,
			title: __( 'Image on right', 'coblocks' ),
			isActive: listPosition === 'right',
			onClick: () => setAttributes( { listPosition: 'right' } ),
		} ];

		const dateFormat = __experimentalGetSettings().formats.date; // eslint-disable-line no-restricted-syntax

		if ( ! hasPosts && postFeedType === 'internal' ) {
			return (
				<Fragment>
					<InspectorControls
						{ ...this.props }
						attributes={ attributes }
						hasPosts={ hasPosts }
						hasFeaturedImage={ hasFeaturedImage }
						editing={ this.state.editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ this.updateStyle }
						categoriesList={ categoriesList }
						featuredList={ featuredList }
						postTypeList={ postTypeList }
						postCount={ latestPosts && latestPosts.length }
						onSelectedPostsChange={ (value) => setAttributes( { selectedPosts : value } ) }
					/>
					<Placeholder
						icon={ <BlockIcon icon={ icon } /> }
						label={ __( 'Blog Posts', 'coblocks' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							<Fragment>
								{ /* translators: %s: RSS */ }
								{ sprintf( __( 'No posts found. Start publishing or add posts from an %s feed.', 'coblocks' ), 'RSS' ) }
								<Button
									className="components-placeholder__cancel-button"
									title={ __( 'Retrieve an External Feed', 'coblocks' ) }
									isLink
									onClick={ () => {
										setAttributes( { postFeedType: 'external' } );
									} }
								>
									{ __( 'Use External Feed', 'coblocks' ) }
								</Button>
							</Fragment>
						}
					</Placeholder>
				</Fragment>
			);
		}

		if ( this.state.editing && postFeedType === 'external' ) {
			return (
				<Fragment>
					<InspectorControls
						{ ...this.props }
						onUserModifiedColumn={ this.onUserModifiedColumn }
						attributes={ attributes }
						hasPosts={ hasPosts }
						hasFeaturedImage={ false }
						editing={ this.state.editing }
						activeStyle={ activeStyle }
						styleOptions={ styleOptions }
						onUpdateStyle={ this.updateStyle }
						categoriesList={ categoriesList }
						featuredList={ featuredList }
						postTypeList={ postTypeList }
						postCount={ latestPosts && latestPosts.length }
						onSelectedPostsChange={ (value) => setAttributes( { selectedPosts : value } ) }
					/>
					<Placeholder
						icon={ <BlockIcon icon={ icon } /> }
						/* translators: %s: RSS */
						label={ sprintf( __( '%s Feed', 'coblocks' ), 'RSS' ) }
						instructions={ sprintf( __( '%s URLs are generally located at the /feed/ directory of a site.', 'coblocks' ), 'RSS' ) }
					>
						<form onSubmit={ this.onSubmitURL }>
							<TextControl
								placeholder={ __( 'https://example.com/feed…', 'coblocks' ) }
								value={ externalRssUrl }
								onChange={ ( value ) => setAttributes( { externalRssUrl: value } ) }
								className={ 'components-placeholder__input' }
							/>
							<Button isLarge type="submit" disabled={ ! externalRssUrl }>
								{ __( 'Use URL', 'coblocks' ) }
							</Button>
						</form>
					</Placeholder>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<InspectorControls
					{ ...this.props }
					onUserModifiedColumn={ this.onUserModifiedColumn }
					attributes={ attributes }
					hasPosts={ hasPosts }
					hasFeaturedImage={ hasFeaturedImage }
					editing={ this.state.editing }
					activeStyle={ activeStyle }
					styleOptions={ styleOptions }
					onUpdateStyle={ this.updateStyle }
					categoriesList={ categoriesList }
					featuredList={ featuredList }
					postTypeList={ postTypeList }
					postCount={ latestPosts && latestPosts.length }
					selectedPosts={ selectedPosts }
					onSelectedPostsChange={ (value) => setAttributes( { selectedPosts : value } ) }
				/>
				<BlockControls>
					{ isHorizontalStyle &&
						<Toolbar
							controls={ toolbarControls }
						/>
					}
					{ postFeedType === 'external' &&
						<Toolbar
							controls={ editToolbarControls }
						/>
					}
				</BlockControls>
				{ postFeedType === 'external' &&
					<Disabled>
						<ServerSideRender
							block="coblocks/posts"
							attributes={ this.props.attributes }
						/>
					</Disabled>
				}
				{ postFeedType === 'internal' &&

					<div className={ className }>
						<div className={ classnames( 'list-none', 'ml-0', 'pl-0', {
							columns: columns,
							[ `columns-${ columns }` ]: columns,
						} ) }>
							{ displayPosts.map( ( post, i ) => {
								const featuredImageUrl = post.featured_media_object ? post.featured_media_object.source_url : null;
								const featuredImageStyle = 'url(' + featuredImageUrl + ')';

								const listClasses = classnames( 'flex', 'flex-auto', 'items-stretch', 'w-full', 'mt-0', 'mb-3', 'ml-0', 'pl-0', {
									'flex-row-reverse': isHorizontalStyle && listPosition === 'right',
									'flex-col': isStackedStyle || isFeaturedStyle,
									'has-featured-image': featuredImageUrl,
								} );

								const contentClasses = classnames( 'wp-block-coblocks-posts__content', 'flex', 'flex-col', 'w-full', {
									'self-center': isHorizontalStyle && ! displayPostContent && columns <= 2,
								} );

								const titleTrimmed = post.title.rendered.trim();

								let excerpt = post.excerpt ? post.excerpt.rendered : '';
								if ( post.excerpt && post.excerpt.raw === '' ) {
									excerpt = post.content.raw;
								}
								const excerptElement = document.createElement( 'div' );
								excerptElement.innerHTML = excerpt;
								excerpt = excerptElement.textContent || excerptElement.innerText || '';

								return (
									<div key={ i } className={ listClasses }>
										{ featuredImageUrl &&
											<div className={ imageClasses }>
												<div className="block w-full bg-cover bg-center-center pt-full" style={ { backgroundImage: featuredImageStyle } }></div>
											</div>
										}
										<div className={ contentClasses }>
											{ displayCategory &&
												<div className="catgory">Categoria</div>
											}
											{ (isStackedStyle || isFeaturedStyle) && displayPostDate && post.date_gmt &&
												<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-posts__date mb-1">
													{ dateI18n( dateFormat, post.date_gmt ) }
												</time>
											}
											<Disabled>
												<a href={ post.link } target="_blank" rel="noreferrer noopener" alt={ titleTrimmed }>
													{ titleTrimmed ? (
														<RawHTML>
															{ titleTrimmed }
														</RawHTML>
													) :
														_x( '(no title)', 'placeholder when a post has no title', 'coblocks' )
													}
												</a>
											</Disabled>
											{ isHorizontalStyle && displayPostDate && post.date_gmt &&
												<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-coblocks-posts__date mt-1">
													{ dateI18n( dateFormat, post.date_gmt ) }
												</time>
											}
											{ displayPostContent &&
												<div className="wp-block-coblocks-posts__post-excerpt mt-1">
													<RawHTML
														key="html"
													>
														{ excerptLength < excerpt.trim().split( ' ' ).length ?
															excerpt.trim().split( ' ', excerptLength ).join( ' ' ) + '…' :
															excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
													</RawHTML>
												</div>
											}
											{ displayPostLink &&
												<RichText
													tagName="a"
													className="wp-block-coblocks-posts__more-link block self-start mt-3"
													onChange={ ( newPostLink ) => setAttributes( { postLink: newPostLink } ) }
													value={ postLink }
													placeholder={ __( 'Read more', 'coblocks' ) }
													multiline={ false }
													withoutInteractiveFormatting={ false }
													isSelected={ false }
												/>
											}
										</div>
									</div>
								);
							} ) }
						</div>
					</div>
				}
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { postsToShow, order, orderBy, categories, selectedPosts, offset, selectedPostTypes, featureds } = props.attributes;
		const { getEntityRecords } = select( 'core' );

		const latestPostsQuery = pickBy( {
			order,
			orderby: orderBy,
			per_page: postsToShow,
			include : selectedPosts.map(p => p.ID),
			offset : selectedPosts.length > 0 || !offset ? 0 : offset,
			categories : categories.filter( c => c != '' ),
			taxonomy : 'featured',
			taxonomy_terms : featureds.filter( f => f != '' ),
		}, ( value ) => ! isUndefined( value ) );

		let cpts = selectedPostTypes.length == 0 ? [ 'post' ] : selectedPostTypes ;
		let latestPosts = [] 

		cpts.map(cpt => {
			let entityRecords = getEntityRecords( 'postType', (cpt == 'any' ? 'post' : cpt), latestPostsQuery )
			if(entityRecords && entityRecords.length > 0){
				latestPosts = [ ...latestPosts, ...entityRecords ]
			}
		}) 

		
		// Limpa quando "Todos" estiver selecionado

		if ( latestPosts.length > 0 ) {
			latestPosts = latestPosts.map( ( post ) => {
				return {
					...post,
					featured_media_object: post.featured_media && select( 'core' ).getMedia( post.featured_media ),
				};
			} );
		}
		
		return {
			latestPosts: latestPosts,
		};
	} ),
] )( AdvancedPostsEdit );
