import Component from './component';

export default class App extends Component {
    constructor(scope) {
		super();
		
		var key,
			desc;
		
		for (key in scope) {
			desc = Object.getOwnPropertyDescriptor(scope, key);
			desc && Object.defineProperty(this, key, desc);
		}
	}
}