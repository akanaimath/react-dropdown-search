'use strict';
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { cloneObject, mergeObjects, cloneProps } from 'react-utility';
import DropdownSearch from '../build/DropdownSearch.js';

class Demo extends React.Component {
	constructor(props) {
		super(props);
		this.state = cloneProps(props);
	}
	render() {
		return (
			<div className="demo-consume">
				<div>This is demo for DropdownSearch</div>
				<div className="demo-comp-container">
					<div className="demo-comp-box">
						<DropdownSearch data={this.state.data.data1} />
					</div>
					{/* <div className="demo-comp-box"><DropdownSearch /></div>
					<div className="demo-comp-box"><DropdownSearch /></div>
					<div className="demo-comp-box"><DropdownSearch /></div> */}
				</div>
			</div>)
	}
	static defaultProps = {
		data: {
			"data1": [{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]
		}
	}
}

render(<Demo />, document.getElementById('app'));


