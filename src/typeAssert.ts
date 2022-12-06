export function isObject(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function is(o: any, type: string) {
  return toString.call(o) === `[object ${type}]`;
}

export function isFunction(o: any): boolean {
  return typeof o === 'function';
}

export function isPromise<T>(o: any): o is Promise<T> {
  return is(o, 'Promise') && isFunction(o.then) && isFunction(o.catch);
}
