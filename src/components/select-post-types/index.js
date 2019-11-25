import { BaseControl, SelectControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch'
const _ = require('lodash')
const { Component } = wp.element;
import './styles/editor.scss';


export default class SelectPostTypes extends Component{
    constructor() {
        super(...arguments);
        this.state = { postTypesList : [], selectedPostTypes : this.props.selectedPostTypes };
    }

    emitValue(value){
        this.props.onPostTypeChange(value)
        this.setState({ selectedPostTypes : value });
    }

    getPostTypes(){
        apiFetch( { path: `/wp-json/coblocks-extended/v1/post-types` } )
        .then(results => {
            this.setState({ postTypesList : results })
        })
    }

    componentDidMount(){
        this.getPostTypes()
    }
    
    render() {
        const id = `inspector-select-posts`;

        return (
            <SelectControl 
                key="query-controls-post-type-select"
                label={ this.props.label }
                value={ this.state.selectedPostTypes }
                multiple={ this.props.multiple }
                options={ this.state.postTypesList }
                onChange={ (event) => this.emitValue(event) }
            ></SelectControl>
        )
    }
}