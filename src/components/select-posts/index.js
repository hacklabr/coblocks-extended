import { BaseControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch'
const _ = require('lodash')
const { Component } = wp.element;
import './styles/editor.scss';


export default class SelectControl extends Component{
    constructor() {
        super(...arguments);
        this.state = { showPostsList : false, filteredPosts : [], selectedPosts : this.props.selectedPosts, searchBox : false };
    }

    emitValue(){
        this.props.onChange(this.state.selectedPosts);
    }

    onChangeValue = _.debounce((value) => {
        this.setState({ showPostsList : true, filteredPosts : [] })

        let postTypesQS = ''
        let { postTypes } = this.props;

        if( postTypes && postTypes.length > 0 ) {
            postTypes.map(cpt => {
                postTypesQS += `&post_type[]=${cpt}`
            })
        }else{
            postTypesQS = 'post_type[]=any'
        }

        apiFetch( { path: `/wp-json/coblocks-extended/v1/posts-by-title?title=${value}&${postTypesQS}` } )
        .then(results => {
            this.setState({ filteredPosts : results.posts })
        })
    }, 2000)

    addPost(post){
        let posts = [ ...this.state.selectedPosts, post ];
        this.setState( { selectedPosts : posts });
        setTimeout(() => this.emitValue() , 100)
    }

    removePost(postID){
        let posts = this.state.selectedPosts.filter(p => p.ID != postID);

        this.setState( { selectedPosts : posts });
        setTimeout(() => this.emitValue() , 100)
    }

    closePostsList(){
        this.setState({ showPostsList : false })
    }

    render() {
        const id = `inspector-select-posts`;

        return (
            <BaseControl label="Selecionar Posts Específicos" id={ id } className="select-posts">
                <input type="text" onChange={(e) => this.onChangeValue(e.target.value)} placeholder="Comece a digitar para procurar por posts"/>
                { this.state.showPostsList && (
                    <div class="select-posts__posts-list">
                        <ul>
                            { this.state.filteredPosts && this.state.filteredPosts.map(post => (
                                <li  dangerouslySetInnerHTML={ { __html : post.title } }  onClick={ () => this.addPost(post) }></li>
                            )) }
                            {
                                (this.state.filteredPosts || this.state.filteredPosts.length == 0) && (
                                    <li>Carregando...</li>
                                )
                            }
                        </ul>
                        <button onClick={() => this.closePostsList() } className="components-button is-button is-default">Fechar</button>
                    </div>
                )
                }
                {
                    this.state.selectedPosts.length > 0 && (
                        <div className="select-posts__selected mt-2">
                            <p><strong>Posts selecionados</strong></p>
                            <ul className="mt-0">
                                { this.state.selectedPosts.map(post => (
                                    <li><span dangerouslySetInnerHTML={ { __html : post.title } }></span> <span className="remove" onClick={ () => this.removePost(post.ID) } >&times;</span> </li>
                                ) ) }
                            </ul>
                        </div>
                    )
                }
            </BaseControl>
        )
    }
}

// function SelectControl( {
//     instanceId,
//     onChange,
//     className,
// 	...props
// } ){
//     const id = `inspector-select-posts-${ instanceId }`;

//     const onChangeValue = ( event ) => {
// 		showPostsList = true;
//     };

//     let showPostsList = true
//     console.log(showPostsList);

// }

// export default withInstanceId( SelectControl );
