import { LightningElement, api } from 'lwc';

export default class CustomCell extends LightningElement {

    @api cellType;
    @api columnName;
    @api cellId;
    @api cellText;

    draftValue;

    lineEdit;
    droplistEdit;

    renderedCallback() {

        if (this.lineEdit && this.template.querySelector("input")) {

            this.template.querySelector("input").focus();

        } else if (this.droplistEdit &&
            this.template.querySelector("select") &&
            this.template.querySelector("option")) {

            this.template.querySelector("select").focus();
            this.template.querySelectorAll("option")[this.options.findIndex(Name => Name == this.cellText)].selected = "selected";

        }
    }

    openEditor(event) {

        switch (this.cellType) {

            case "text":
                this.lineEdit = true;
                break;

            case "droplist":
                this.droplistEdit = true;
                break;

            default:
        }
    }

    @api proceedSave(event) {

        this.draftValue = event.target.value;
        this.cellText = this.draftValue;

        this.lineEdit = false;
        this.droplistEdit = false;

        const passingNewValues = new CustomEvent('unfocused', {
            detail: {
                draftValue: this.draftValue,
                cellId: this.cellId,
                columnName: this.columnName
            }

        });
        this.dispatchEvent(passingNewValues);
    }





    draftValues = [];


}