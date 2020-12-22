import { LightningElement, api } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class InlineEditDeleteModal extends LightningElement {

    openModal = false;

    @api deleteId;
    @api accountName;

    @api displayModal() {
        this.openModal = true;
    }

    invokeDeleteEntry() {

        this.openModal = false;
        this.dispatchEvent(new CustomEvent("deleteinprogress"));

        deleteRecord(this.deleteId)
            .then(() => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );

                const deleteComplete = new CustomEvent('deletecomplete', {
                    detail: {
                        success: true,
                        id: this.deleteId
                    }
                });
                this.dispatchEvent(deleteComplete);

            }).catch(error => {

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );

                const deleteComplete = new CustomEvent('deletecomplete', {
                    detail: {
                        success: false,
                        id: this.deleteId
                    }
                });
                this.dispatchEvent(deleteComplete);

            });
    }

    closeModal() {
        this.openModal = false;
    }

}