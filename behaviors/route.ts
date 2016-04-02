import {Behavior} from '../mahalo';
import {setRoute} from '../components/route';

export default class Route extends Behavior {
    static inject = {element: Element};
    
    element: Element;
    
    click: EventListener;
    
    constructor(id) {
        super(id);
        
        this.click = event => {
            if (!setRoute(id)) {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };
        
        this.element.addEventListener('click', this.click);
    }
    
    remove() {
        this.element.removeEventListener('click', this.click);
    }
}