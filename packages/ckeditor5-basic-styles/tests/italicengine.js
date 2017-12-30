/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ItalicEngine from '../src/italicengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'ItalicEngine', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ItalicEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ItalicEngine ) ).to.be.instanceOf( ItalicEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$text' ], 'italic' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'italic' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'italic' ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register italic command', () => {
			const command = editor.commands.get( 'italic' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'italic' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <em> to italic attribute', () => {
			editor.setData( '<p><em>foo</em>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert <i> to italic attribute', () => {
			editor.setData( '<p><i>foo</i>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert font-weight:italic to italic attribute', () => {
			editor.setData( '<p><span style="font-style: italic;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<em>foo</em>bar' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><i>foo</i>bar</p>' );
		} );
	} );
} );
