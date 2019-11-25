/**
 * Internal dependencies
 */
import { buildTermsTree } from './terms';
import { TreeSelect } from '@wordpress/components';

export default function CategorySelect( { label, noOptionLabel, categoriesList, selectedCategoryId, onChange } ) {
	const termsTree = buildTermsTree( categoriesList );
	let selectedTerms = selectedCategoryId

	const handleChange = (e) => {
		var options = e.target.options;
		var value = [];
		for (var i = 0, l = options.length; i < l; i++) {
		  if (options[i].selected) {
			value.push(options[i].value);
		  }
		}
		selectedTerms = value;
		onChange(value)
	  }

	return (
		<div>
			<label class="components-base-control__label">{ label }</label>
			<select class="components-select-control__input" onChange={ (e) => { handleChange(e) } } multiple="multiple">
				<option value="">{ noOptionLabel }</option>
				{
					termsTree.map(option =>  (
						<option value={ option.id } selected={ selectedTerms.indexOf(option.id.toString()) > -1 }>{ option.name }</option>
					))
				}
			</select>
			<p class="components-base-control__help">Segure o CTRL enquanto clica para selecionar múltiplas categorias.</p>
		</div>
	);
}
