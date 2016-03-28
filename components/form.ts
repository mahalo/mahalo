import Component from '../app/component';
import ComponentController from '../app/component-controller';

export default class Form extends Component {
	static inject = {element: Element};
	
	static locals = {fields: '$fields'};
	
	element: Element;
	
	fields = {};
	
	valid = true;
	
	dirty = false;
	
	submit: EventListener;
	
	constructor() {
		super();
		
		this.submit = event => {
			if (this.valid) {
				return;
			}
			
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		};
		
		this.element.addEventListener('submit', this.submit);
	}
	
	remove() {
		this.element.removeEventListener('submit', this.submit);
	}
	
	setValue(name: string, value) {
		if (!this.validateField(name, value)) {
			return false;
		}
		
		var field = this.fields[name];
		
		if ('value' in field) {
			this.dirty = true;
		}
		
		field.value = value;
		
		this.validateForm();
		
		return true;
	}
	
	validateField(name: string, value) {
		var field = this.fields[name],
			valid = true;
		
		field.validators.forEach(validator => {
			valid = validator(value);
		});
		
		return field.valid = valid;
		
	}
	
	validateForm() {
		var fields = this.fields,
			valid = true,
			name;
		
		for (name in fields) {
			if (!fields[name].valid) {
				valid = false;
				break;
			}
		}
		
		this.valid = true;
	}
}