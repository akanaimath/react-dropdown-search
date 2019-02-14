'use strict';
import React, { Component } from 'react';
import { cloneObject, cloneProps } from 'react-utility';
import "./DropdownSearch.css";

class DropdownSearch extends Component {
    static buildData(props) {
        let list = [], hash = [];
        let selectElement = +props.defaultSelectElement;
        const valueKey = props.hasOwnProperty("valueKey") ? props.valueKey : "value",
            defaultChecked = props.hasOwnProperty("defaultChecked") ? props.defaultChecked : true,
            defaultSelectElement = props.hasOwnProperty("defaultSelectElement") ? props.defaultSelectElement : 0;


        if (props.hasOwnProperty("data") && props.data.length > 0) {
            // Priority :1
            if (props.hasOwnProperty("selectFromData") && props.selectFromData) {
                const selectedKey = props.hasOwnProperty("selectedKey") ? props.selectedKey : "selected";

                props.data.map((obj) => {
                    if (obj[selectedKey] && typeof (obj[selectedKey]) == 'boolean') {
                        list.push(obj[valueKey]);
                        hash.push(obj);
                    }
                })
                // checking if multiSelect is false, then list should have only one element
                // defaultSelectElement = 0 
                if (!props.multiSelect) {
                    selectElement = Math.floor(defaultSelectElement) % list.length || 0;
                    list = (list.length > 0 && defaultChecked) ? [list[selectElement]] : [];
                    hash = (hash.length > 0 && defaultChecked) ? [hash[selectElement]] : [];
                }
            }

            // Priority :2
            else if (props.hasOwnProperty('input') && props.input != null && typeof (props.input) == 'object' && props.input.constructor == Array) {
                // just to check if input values are wrong
                props.data.map((obj) => {
                    if (props.input.includes(obj[valueKey])) {
                        list.push(obj[valueKey]);
                        hash.push(obj);
                    }
                })
                // checking if multiSelect is false, then list should have only one element
                // defaultSelectElement = 0 
                if (!props.multiSelect) {
                    selectElement = Math.floor(defaultSelectElement) % list.length || 0;
                    list = (list.length > 0 && defaultChecked) ? [list[selectElement]] : [];
                    hash = (hash.length > 0 && defaultChecked) ? [hash[selectElement]] : [];
                }
            }

            // Priority :3
            // if selectFromData is false, neither input is given then we calculate the input based on multiSelect feature
            else if (props.hasOwnProperty("multiSelect") && typeof (props.multiSelect) == 'boolean') {
                if (props.multiSelect) {
                    if (props.defaultChecked) {
                        list = props.data.map((Obj) => Obj[valueKey]);
                        hash = props.data;
                    }
                }
                // this condition is for single select
                else if (!props.multiSelect && props.defaultChecked) {
                    selectElement = (Math.floor(defaultSelectElement) % props.data.length) || 0;
                    list.push(props.data.map((Obj) => Obj[valueKey])[selectElement]);
                    hash.push(props.data[selectElement]);
                }
            }
        }
        return { list: list, hash: hash };
    }
    constructor(props) {
        super(props);
        this.state = this.buildState(props);
        this.node = null;
        this.timer = null;
        this.timer2 = null;
        this.mounted = false;
    }
    buildState = (props = this.state) => {
        const state = cloneProps(props);
        state.optionsList = props.ddList || [];
        state.checkBoxList = [];
        state.checkBoxHash = [];
        state.inputObj = DropdownSearch.buildData(props);
        state.input = state.inputObj.list;
        state.showAll = true;
        return state;
    }
    componentDidCatch = (error, info) => {
        this.setState({ error: true, loading: false, error: `Error in npm DropdownSearch , MoreInfo:${error}` });
    }

    componentDidMount() {
        this.mounted = true;
        const state = this.dataload(this.state);
        this.setState(state);
    }
    componentWillReceiveProps(newProps) {
        if (!this.isDatasEqual(newProps.data, this.props.data) || JSON.stringify(newProps.input) != JSON.stringify(this.props.input)) {
            const state = this.buildState(newProps);
            Object.assign(state, this.dataload(state));
            this.setState(state);
        }
    }
    dataload = (props = this.state) => {
        const state = cloneProps(props, ["data"]);
        const data = props.data;
        // this.data = data;
        const ddList = data.map((obj) => {
            let returnObj = { label: obj[state.labelKey], value: obj[state.valueKey] };
            if (state.selectFromData) {
                if (obj.hasOwnProperty(state.selectedKey)) {
                    returnObj["selected"] = obj[state.selectedKey];
                }
                else {
                    returnObj["selected"] = state.defaultChecked;
                }
            }
            return returnObj;
        });

        const uniqueDataList = state.selectUniqList ? this.uniqueList(ddList) : ddList;

        state.ddList = uniqueDataList;
        state.optionsList = uniqueDataList;
        state.data = data;
        state.loading = false;

        let checkBoxList = [];
        let checkBoxHash = [];
        const inputObj = state.inputObj;
        state.ddList.forEach((obj) => {
            if (Object.keys(inputObj).length > 0 && inputObj.list.includes(obj.value)) {
                checkBoxList.push(obj.value);
                checkBoxHash.push(obj);
            }
        })
        state.defaultChecked = (checkBoxList.length == uniqueDataList.length && checkBoxList.length != 0);
        state.checkBoxList = checkBoxList;
        state.checkBoxHash = checkBoxHash;
        state.inputObj = { list: checkBoxList, hash: checkBoxHash };
        state.input = checkBoxList;
        return state;
    }
    /**
     * @param arr: array of list that's needs to be unique
     * @param arrOfObject: boolean, default: true, will return array of objects, or set to false , returns unique list of strings
     * 
     */
    uniqueList = (arr = [], arrOfObject = true) => {
        const uniqueDataList = [];
        if (arrOfObject) {
            arr.filter((obj) => {
                const index = uniqueDataList.findIndex(x => x.value == obj.value);
                if (index <= -1) {
                    const row = { label: obj.label, value: obj.value };
                    if (this.state.selectFromData) {
                        row["selected"] = obj["selected"];
                    }
                    uniqueDataList.push(row);
                }
                return null;
            });
            return uniqueDataList;
        }
        else {
            arr.filter((str) => {
                const index = uniqueDataList.findIndex(x => x == str);
                if (index <= -1) {
                    uniqueDataList.push(str);
                }
                return null;
            })
            return uniqueDataList;
        }
    }
    componentWillMount() {
        document.addEventListener('click', this.handleOutsideClick, false);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        clearTimeout(this.timer2);
        this.clearList();
        this.mounted = false;
        document.removeEventListener('click', this.handleOutsideClick, false);
    }

    clearList() {
        this.setState({ input: [], checkBoxList: [], checkBoxHash: [], inputObj: {} });
    }
    sortArr = (arr = [], defaultSort = true) => {
        if (!defaultSort) {
            return arr;
        }

        arr.sort((a, b) => { return (b.label < a.label ? 1 : (b.label > a.label) ? -1 : 0) });
        return arr;

    }
    checkboxOption() {
        const optionsList = this.sortArr(this.state.optionsList, this.state.defaultSort);
        let allChecked = this.state.defaultChecked;
        return (
            <div className={this.state.classNameDDListOptions}>
                {this.state.multiSelect && this.state.showAll && this.state.showAllText.length > 0 &&
                    <label className={this.state.classNameCheckboxList}>{this.state.showAllText}
                        <input type="checkbox"
                            name='all'
                            checked={allChecked}
                            onChange={this.handleAllCheckBox}
                        />
                        <span className={this.state.classNameCheckmark} />
                    </label>
                }
                {optionsList.length > 0 ?
                    optionsList.map((obj, index) => {
                        const checked = typeof (this.state.checkBoxHash.find((hashObj) => hashObj.label == obj.label)) == "object" ? true : false;
                        return (
                            <label key={'checkbox_' + index} className={this.state.multiSelect ? this.state.classNameCheckboxList : this.state.classNameRadioList}>{obj.label}
                                {this.state.multiSelect ?
                                    (
                                        <input type='checkbox'
                                            name={obj.value}
                                            checked={checked}
                                            onChange={(e) => { this.handleCheckBox(e, obj.label, this.state) }}
                                        />
                                    )
                                    : (
                                        <input type='radio'
                                            name={obj.value}
                                            checked={checked}
                                            onChange={(e) => { this.handleRadio(e, obj.label, this.state) }}
                                        />
                                    )
                                }
                                <span className={this.state.multiSelect ? this.state.classNameCheckmark : this.state.classNameRadiomark} />
                            </label>)
                    }) :
                    <label className={this.state.classNameNoOptText}>{this.state.noOptionText}</label>
                }
            </div>
        )
    }

    container = () => {
        const labelName = this.getLabelName(this.state);
        return (
            <div className={this.state.classNameDDWrapper} style={{ borderColor: this.state.borderColor }} ref={node => { this.node = node; }}>
                <div className={this.state.classNameDDSeach} >
                    <div style={{ width: '100%', height: '100%' }}>
                        {this.state.showSearch && <input
                            type='text'
                            placeholder={this.state.placeholder}
                            onChange={(e) => { this.handleDDSearch(e, this.state) }}
                            className={this.state.classNameDDSeachBar}
                            onFocus={() => { this.setState({ dropdownOpen: true }); }}
                        />}
                        <div className={this.state.showSearch ? this.state.classNameSelectedLabel : this.state.classNameLabel} onClick={this.showDDOptions}>
                            {labelName}
                        </div>
                    </div>
                    <span className={this.state.classNameDDArrowButton} onClick={this.showDDOptions}>
                        {this.state.dropdownOpen
                            ? <i className={this.state.classNameDownArrow} />
                            : <i className={this.state.classNameUpArrow} />
                        }
                    </span>
                </div>
                <div>
                    {this.state.dropdownOpen && (
                        <div className={this.state.ClassNameDDList}>
                            {this.checkboxOption()}
                            {this.state.buttons.length > 0 && this.getButtons()}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    render() {
        if (!this.mounted) {
            return "";
        }

        return (
            <div className={this.state.classNameWrapper} style={{ position: "relative" }}>
                {this.state.heading.length > 0 &&
                    <div className={this.state.classNameHeading} style={{ color: this.state.labelColor }}>{this.state.heading}</div>
                }
                {this.state.loading && !this.state.error && <div>{this.state.loadingText}</div>}
                {!this.state.loading && this.state.error && <div>{this.state.error}</div>}
                {!this.state.loading && !this.state.error ?
                    this.container() :
                    (<div>{`check the data passed`}</div>)
                }
                {this.state.isPending && <div className={this.state.classNamePending}></div>}
            </div>
        )
    }

    getButtons = () => {
        return (
            <div className={this.state.classNameButtonWrap}>
                {this.state.buttons.map((ele, index) => {
                    return <div className={this.state.classNameButton} key={`index:${index} = ${ele}`} onClick={(e) => { this.handleSubmit(e, ele) }}>{ele}</div>
                })}
            </div>
        )
    }
    getLabelName = (state = this.state) => {
        let tempLabelObj = state.optionsList.find(obj => obj.value === state.checkBoxList[0]) || {};
        if (!state.multiSelect && state.checkBoxHash.length > 0) {
            tempLabelObj = state.checkBoxHash[0];
        }
        const tempLabel = ((typeof tempLabelObj.label == "number") ? tempLabelObj.label.toString() : tempLabelObj.label) || "";
        let labelName = 'Please select an option';
        if (state.showLabelsSelected && !state.showSearch && state.checkBoxList.length > 0) {
            labelName = "";
            let temp = "";
            state.optionsList.forEach((obj) => {
                state.checkBoxList.forEach((ele, index) => {
                    if (obj.value == ele) {
                        labelName = (index == 0) ? (temp + obj.label) : (temp + ", " + obj.label);
                        temp = labelName;
                    }
                })
            })
        }
        else if (!state.showLabelsSelected && state.showSearch) {
            labelName = state.multiSelect ?
                `${state.checkBoxList.length} selected` :
                (
                    ((typeof state.checkBoxList[0] == "string" || typeof state.checkBoxList[0] == "number") ? tempLabel.toString() : 'Please select an option')
                );
        }
        else if (!state.showLabelsSelected && !state.showSearch && state.checkBoxList.length > 0) {
            labelName = `${state.checkBoxList.length} selected`;
        }

        return labelName;
    }
    handleDDSearch = (event, state = {}) => {
        const searchStr = (event.target.value).toLowerCase();
        const filteredList = state.ddList.filter((obj) => {
            let strCmp = state.searchUsingLabel ? obj.label : obj.value;
            if (typeof strCmp != "string") {
                strCmp = strCmp.toString();
            }
            return (
                obj.value == null ? true :
                    (strCmp.toLowerCase().indexOf(searchStr) !== -1)
            );
        });

        let showAll = false;
        if ((filteredList.length == state.ddList.length) && state.multiSelect) {
            showAll = true;
        }

        this.setState({ optionsList: filteredList, showAll: showAll });
    }

    showDDOptions = () => {
        this.setState(prevState => ({ dropdownOpen: !prevState.dropdownOpen }));
    }

    handleAllCheckBox = (event) => {
        if (event.target.checked) {
            this.setState({ defaultChecked: true, checkBoxList: this.checkAllOptions(), checkBoxHash: this.state.optionsList }, this.handleCheckboxChange);
        }
        else {
            this.setState({ defaultChecked: false, checkBoxList: [], checkBoxHash: [] }, this.handleCheckboxChange);
        }
    }
    checkAllOptions = (arr = this.state.optionsList) => {
        return arr.map((obj) => {
            return obj.value
        })
    }
    handleCheckboxChange = () => {
        this.timer = setTimeout(() => {
            const data = (this.state.passList ? this.state.checkBoxList : this.state.checkBoxHash);
            this.state.onChange(data);
        }, parseInt(this.state.waitTime));
    }

    handleSubmit = (e, button = "") => {
        this.timer2 = setTimeout(() => {
            this.state.onSubmit({ buttonClicked: button, selectedData: state.inputObj.hash });
        }, parseInt(this.state.waitTime));
    }

    handleCheckBox = (event, label, state = {}) => {
        if (event.target.checked) {
            let checkBoxList = state.checkBoxList;
            let checkBoxHash = state.checkBoxHash;
            if (state.defaultChecked) {
                checkBoxList = [];
                checkBoxHash = [];
            }
            state.optionsList.forEach((obj) => {
                if (obj.label == label) {
                    checkBoxList.push(obj.value);
                    checkBoxHash.push(obj);
                }
                else if (event.target.name == obj.value.toString()) {
                    checkBoxList.push(obj.value);
                    checkBoxHash.push(obj);
                }
            })
            // checkBoxList.push(event.target.name)
            let allchecked = false;
            if (checkBoxList.length === state.optionsList.length) {
                allchecked = true;
            }
            this.setState(
                {
                    defaultChecked: allchecked,
                    checkBoxList: checkBoxList,
                    input: checkBoxList,
                    checkBoxHash: checkBoxHash,
                    inputObj: { list: checkBoxList, hash: checkBoxHash },
                }, this.handleCheckboxChange);
        }
        else {
            const input = state.checkBoxList.filter((ele) => (ele.toString() !== event.target.name));
            const arrHash = [];
            state.optionsList.forEach((obj) => {
                if (input.includes(obj.value)) {
                    arrHash.push(obj);
                }
            })
            this.setState({
                defaultChecked: false,
                checkBoxList: input,
                input: input,
                checkBoxHash: arrHash,
                inputObj: { list: input, hash: arrHash },
            }, this.handleCheckboxChange);
        }
    }
    handleRadio = (event, label, state = {}) => {
        if (event.target.checked) {
            let checkBoxList = state.checkBoxList,
                checkBoxHash = state.checkBoxHash;
            state.optionsList.forEach((obj) => {
                if (obj.label == label) {
                    checkBoxList[0] = (obj.value);
                    checkBoxHash[0] = obj;
                }
            })
            this.setState({ checkBoxList: checkBoxList, checkBoxHash: checkBoxHash }, this.handleCheckboxChange);
        }
        else {
            const input = state.checkBoxList.filter((ele) => (ele.toString() !== event.target.name));
            const arrHash = [];
            state.checkBoxHash.forEach((obj) => {
                if (obj.label != label) {
                    arrHash.push(obj);
                }
            })
            this.setState({
                checkBoxList: input,
                input: input,
                checkBoxHash: arrHash,
                inputObj: { list: input, hash: arrHash },
            }, this.handleCheckboxChange);
        }
    }

    handleOutsideClick = (e) => {
        if (this.node == null) {
            return;
        }
        if (this.node.contains(e.target)) {
            return;
        }
        this.setState({ dropdownOpen: false });
    }
    isDatasEqual = (arr1, arr2) => {
        if (arr1.length != arr2.length || !Array.isArray(arr1) || !Array.isArray(arr2)) {
            return false;
        }
        else {
            let objAreSame = true;
            for (let i = 0; i < arr1.length; i++) {
                objAreSame = true;
                let obj1 = arr1[i], obj2 = arr2[i];
                for (var property in obj1) {
                    if (obj1[property] !== obj2[property]) {
                        objAreSame = false;
                        break;
                    }
                }
                if (!objAreSame)
                    break;
            }
            return objAreSame;
        }
    }
}

const css = {

    classNameWrapper: 'css-dd-comp-wrapper',
    classNameHeading: "css-dd-heading",
    classNameDDWrapper: 'css-dd-wrapper',
    classNameDDSeach: 'css-dd-search library-sb-icons',
    classNameDDSeachBar: 'css-dd-searchbar',
    classNameDDArrowButton: 'css-dd-arrow-button',
    classNameDownArrow: 'icon-uniE63C',
    classNameUpArrow: 'icon-uniE63D',
    ClassNameDDList: 'css-dd-list',
    classNameDDListOptions: 'css-dd-list-options',
    classNameCheckboxList: 'css-checkbox-list',
    classNameRadioList: 'css-radio-list',
    classNameCheckmark: 'css-checkmark',
    classNameRadiomark: 'css-radiomark',
    classNameSelectedLabel: 'css-dd-selected-label',
    classNameLabel: "css-dd-label",
    classNamePending: "css-dd-pending",
    classNameNoOptText: "css-dd-noOptText",
    classNameButtonWrap: "css-dd-buttonWrap",
    classNameButton: "css-dd-button",
};

DropdownSearch.defaultProps = {
    //input: [],
    data: [],
    labelKey: "label",
    valueKey: "value",
    selectedKey: "selected",
    placeholder: "Search...",
    heading: "",
    dropdownOpen: false,
    defaultChecked: true,
    showSearch: true,
    showLabelsSelected: false,
    multiSelect: true,
    waitTime: 2000,
    isPending: false,
    defaultSort: false,
    selectFromData: false,
    onChange: () => { },
    loadingText: "...loading",
    noOptionText: "No items found!",
    searchUsingLabel: true,
    showAllText: "Select All",
    selectUniqList: false,
    passList: true,
    onSubmit: () => { }, // used when buttons have some value
    buttons: [], // ex: ["Submit", "Reset"]
    defaultSelectElement: 0,
    borderColor: "#002133",
    labelColor: "#7575a3",


    loading: true,
    inputObj: {},
    error: false,
    dimensions: {
        width: -1,
        height: -1
    },

};

Object.assign(DropdownSearch.defaultProps, css);

export default DropdownSearch;

// End of the module
