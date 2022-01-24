import { FormControl, ValidationErrors } from "@angular/forms";

export class Lub2ShopValidators {

    static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
        // check if string only contains whitespace
        if ((control.value != null) && (control.value.trim().length === 0)) {
            // invalid, return error
            return { 'notOnlyWhiteSpace': true};
        }
        return null;
    }

}
