import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from 'lightning/uiRecordApi';

import getAccountList from '@salesforce/apex/AccountListController.getAccountList';

const columns = [
    { label: '', fieldName: 'Index', resizable: false },
    { label: 'Name', fieldName: 'Name', resizable: true },
    { label: 'Rating', fieldName: 'Rating', resizable: true },
    { label: 'Delete', fieldName: 'Delete', resizable: false }
];

export default class InlineEdit extends LightningElement {

    columns = columns;

    tableValues;
    tableFetched = false;
    displaySpinner = false;

    returnValue;
    returnId;
    returnColumn;
    returnRow;

    newDraftValue;
    draftValues = [];
    draftNotEmpty = false;

    deleteId;
    deleteName;


    renderedCallback() {
        this.tableFetched ? undefined : this.fetchList();
    }

    fetchList() {
        getAccountList()
            .then(result => {

                this.tableValues = result.map((currValue, currIndex) => {
                    return {
                        Index: currIndex + 1,
                        ...currValue
                    };
                });

                this.tableFetched = true;
                this.displaySpinner = false;
            })
            .catch(error => {
                this.error = error;

                this.tableFetched = true;
                this.displaySpinner = false;
            });
    }

    handleSave(event) {

        const recordInputs = this.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));

        this.displaySpinner = true;

        Promise.all(promises).then(contacts => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            );
            this.clearDrafts();

        }).catch(error => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Account update failed',
                    variant: 'error'
                }))
            this.displaySpinner = false;

        });
    }

    handleCancel() {
        this.clearDrafts();
    }

    clearDrafts() {

        this.template.querySelectorAll("c-custom-cell").forEach(
            (element) => element.classList.remove("kds-cell-isedited")
        );
        this.draftValues = [];
        this.draftNotEmpty = false;

        this.tableFetched = false;
        this.displaySpinner = true;
    }

    proceedChangedValue(event) {

        this.returnValue = event.detail.draftValue;
        this.returnId = event.detail.cellId;
        this.returnColumn = event.detail.columnName;
        this.returnRow = this.tableValues.find((obj) => obj.Id == this.returnId);

        this.draftValues = this.draftValues.filter(
            (obj) => obj.Id !== this.returnId || !obj.hasOwnProperty(this.returnColumn)
        );

        if (!(!this.returnRow.hasOwnProperty(this.returnColumn) && this.returnValue == "") &&
            this.returnRow[this.returnColumn] !== this.returnValue
        ) {
            this.newDraftValue = {};
            this.newDraftValue["Id"] = this.returnId;
            this.newDraftValue[this.returnColumn] = this.returnValue;
            this.draftValues.push(this.newDraftValue);

            event.target.classList.add("kds-cell-isedited");
        } else {
            event.target.classList.remove("kds-cell-isedited");
        }

        this.draftNotEmpty = (this.draftValues.length == 0) ? false : true;
    }

    handleDelete(event) {

        this.deleteId = event.target.dataset.id;
        this.deleteName = this.tableValues.find((obj) => obj.Id == this.deleteId).Name;
        this.template.querySelector('c-inline-edit-delete-modal').displayModal();
    }

    deleteInProgress() {

        this.displaySpinner = true;
    }

    deleteComplete(event) {

        if (event.detail.success) {
            this.draftValues = this.draftValues.filter((obj) => obj.Id !== event.detail.id);
            this.template.querySelectorAll('[data-row="' + event.detail.id + '"]').forEach(
                (element) => element.classList.add("kds-cell-deleted")
            );
        }

        this.displaySpinner = false;
    }
}