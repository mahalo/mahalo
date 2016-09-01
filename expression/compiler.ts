/**
 * This module contains the compiler for Mahalo expressions.
 */

/***/

import {IExpressionBranch} from './parser';
import types from './types';
import {filters} from './filters';
import {default as Scope, getComponent} from '../app/scope';

/**
 * Compiles a given branch inside of a provided context
 * and returns the result.
 */
export default function compileBranch(branch: IExpressionBranch, ctx: Object) {
    switch (branch.type) {
        case types.Comparison:
            return compileComparison(branch, ctx);
        
        case types.Sum:
            return compileSum(branch, ctx);
        
        case types.Multiply:
            return compileMultiply(branch, ctx);
            
        case types.Filter:
            return compileFilter(branch, ctx);
        
        case types.Unary:
            return compileUnary(branch, ctx);
        
        case types.Parenthesis:
            return compileBranch(branch.content, ctx);
        
        case types.Member:
            return compileMember(branch, ctx);
            
        case types.Object:
            return compileObject(branch, ctx);
            
        case types.Array:
            return compileArray(branch, ctx);
            
        case types.Call:
            return compileCall(branch, ctx);
            
        case types.Reserved:
            return compileReserved(branch, ctx);
        
        case types.Literal:
            return branch.str;
        
        case types.Number:
            return parseFloat(branch.num);
        
        case types.Identifier:
            if (ctx instanceof Object) {
                return compileMemberAccess(ctx, branch.name);
            }
            break;
        
        case types.BracketIdentifier:
            if (ctx instanceof Object) {
                return compileMemberAccess(ctx, compileBranch(branch.prop, ctx));
            }
    }
}


//////////


function compileComparison(branch: IExpressionBranch, ctx: Object) {
    let left = compileBranch(branch.left, ctx);
    let right = compileBranch(branch.right, ctx);
        
    switch (branch.op) {
        case '==':
            return left == right;
            
        case '<=':
            return left <= right;
            
        case '>=':
            return left >= right;
            
        case '!=':
            return left != right;
            
        case '<':
            return left < right;
            
        case '>':
            return left > right;
    }
}

function compileSum(branch: IExpressionBranch, ctx: Object) {
    let left = compileBranch(branch.left, ctx);
    let right = compileBranch(branch.right, ctx);
    
    if (branch.op === '+') {
        return left + right;
    }
    
    return left - right;
}

function compileMultiply(branch: IExpressionBranch, ctx: Object): number {
    let op = branch.op;
    let left = compileBranch(branch.left, ctx);
    let right = compileBranch(branch.right, ctx);
    
    if (op === '*') {
        return left * right;
    }
    
    if (op === '/') {
        return left / right;
    }
    
    return left % right;
}

function compileFilter(branch: IExpressionBranch, ctx: Object) {
    let filter = filters[branch.filter];
    
    if (typeof filter !== 'function') {
        throw Error('Missing filter ' + branch.filter);
    }
    
    let args = [compileBranch(branch.arg, ctx)];
    let branches = branch.args;
    let len = branches.length;
    let i = 0;
    
    if (len) {
        while (i < len) {
            args.push(compileBranch(branches[i++], ctx));
        }
    }
    
    return filter.apply(null, args);
}

function compileUnary(branch: IExpressionBranch, ctx: Object): any {
    let op = branch.op;
    let arg = compileBranch(branch.arg, ctx);
    
    if (op === '!') {
        return !arg;
    }
    
    if (op === '-') {
        return -arg;
    }
    
    return +arg;
}

function compileMember(branch: IExpressionBranch, ctx: Object, scope?: Object) {
    if (!(ctx instanceof Object)) {
        return;
    }
    
    let obj;
    
    if (branch.obj.type === types.Identifier) {
        
        obj = compileMemberAccess(ctx, branch.obj.name);
        
    } else if (branch.obj.type === types.BracketIdentifier) {
        
        obj = compileMemberAccess(ctx, compileBranch(branch.obj.prop, scope || ctx));
        
    } else {
        
        obj = compileBranch(branch.obj, ctx);
        
    }
    
    if (!(obj instanceof Object)) {
        return;
    }
    
    let prop = branch.prop;
    
    if (prop.type === types.Member) {
        return compileMember(prop, obj, scope);
    }
    
    if (prop.type === types.BracketIdentifier) {
        return obj[compileBranch(prop.prop, scope || ctx)];
    }
    
    if (prop.type === types.Call) {
        return compileCall(prop, ctx, obj);
    }
    
    return obj[prop.name];
}

function compileObject(branch: IExpressionBranch, ctx: Object) {
    let obj = {};
    let map = branch.keys;
    let keys = Object.keys(map);
    let len = keys.length;
    let i = 0;;
    
    while (i < len) {
        let key = keys[i++];
        
        obj[key] = compileBranch(map[key], ctx);
    }
    
    return obj;
}

function compileArray(branch: IExpressionBranch, ctx: Object) {
    let arr = [];
    let items = branch.items;
    let item = items[0];
    let i = 0;
    
    while (item) {
        arr.push(compileBranch(item, ctx));
        
        item = items[++i];
    }
    
    return arr;
}

function compileCall(branch: IExpressionBranch, ctx: Object, obj?: Object) {
    let method = compileBranch(branch.prop, ctx);
    
    if (typeof method !== 'function') {
        return;
    }
    
    let items = branch.args;
    let item = items[0];
    let i = 0;
    let args = [];
    
    while (item) {
        args.push(compileBranch(item, ctx));
        item = items[++i];
    }
    
    return method.apply(obj || ctx, args);
}

function compileReserved(branch: IExpressionBranch, ctx: Object) {
    switch (branch.str) {
        case 'true':
            return true;
            
        case 'false':
            return false;
            
        case 'null':
            return null;
    }
}

function compileMemberAccess(obj: Object, key: string|number) {
    if (obj instanceof Scope) {
        obj = getComponent.call(obj, key);
    }
    
    if (obj instanceof Object) {
        return obj[key];
    }
}