var privObj = {
		a: 0,
		b: 1
	},
    privNum = 1;

function privFn() {
    return privObj.a + privNum;
}

export default class App {
	constructor() {
		this.value = 5;
	}

    get getter() {
        var privNum = 4;

        function localFn() {
            return privNum + privObj.b;
        }

        return localFn() + privFn() + this.method();
    }

    method() {
        return this.value;
    }
}

export function updateA() {
	privObj.a++;
}

export function updateB() {
	privObj = {
    	a: 1,
		b: 2
	};
}