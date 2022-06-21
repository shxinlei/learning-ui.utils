import ArrayUtils from "./ArrayUtils"
import ObjectUtils from "./ObjectUtils"
import { cloneDeep } from "lodash-es"
export const NumberEqual = (a: unknown, b: unknown) => {
    if (typeof a === "number" && typeof b === "number") {
        return a === b
    } else {
        return false
    }
}

export const StringEqual = (a: unknown, b: unknown) => {
    if (typeof a === "string" && typeof b === "string") {
        return a === b
    } else {
        return false
    }
}

export const BooleanEqual = (a: unknown, b: unknown) => {
    if (typeof a === "boolean" && typeof b === "boolean") {
        return a === b
    } else {
        return false
    }
}

export const undefinedEqual = (a: unknown, b: unknown) => typeof a === "undefined" && typeof b === "undefined";

export const nullEqual = (a: unknown, b: unknown) => typeof a === "object" && typeof b === "object" && a === null && b === null;

export const isObject = (any: unknown) => typeof any === 'object' && any !== null && typeof any !== undefined && !Array.isArray(any);

/**
 * 数据对比
 * @param a
 * @param b
 * @return boolean
 */
export const isEqual = (a: unknown, b: unknown) => {

    if (Array.isArray(a) && Array.isArray(b)) {
        return ArrayUtils.isEqual(a, b)
    } else if (isObject(a) && isObject(b)) {
        return ObjectUtils.isEqual(a as any, b as any);
    } else {
        if (typeof a === "number") {
            return NumberEqual(a, b);
        }

        if (typeof a === "string") {
            return StringEqual(a, b);
        }

        if (typeof a === "undefined") {
            return undefinedEqual(a, b);
        }

        if (a === null) {
            return nullEqual(a, b);
        }

        if (typeof a === "boolean") {
            return BooleanEqual(a, b);
        }
    }

    return false;

}


/**
 * 生成 uuid
 * @param len number
 * @param radix 
 * @returns string
 */
export const uuid = (len: number = 32, radix: number = 16): string => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
        '',
    );
    let uuid = [],
        i;
    radix = radix || chars.length;

    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
    } else {
        let r;
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | (Math.random() * 16);
                uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}



/**
 * 深度克隆数据
 * @returns
 * @param target
 */
export const formDeepClone = <T>(target: T[] | T): T | T[] | unknown => cloneDeep(target);


/**
 * 传入滚动事件返回滚动后的事件
 * @param e
 * @param callback
 */
export const scrollHandel = <T>(e:T | any , callback: (arg:T) => void) => {
    const height: number = e.target.clientHeight;
    const scrollHeight: number = e.target.scrollHeight;
    const scrollTop: number = e.target.scrollTop;

    if (height + scrollTop >= scrollHeight) {
        callback && callback(e);
    }
};

