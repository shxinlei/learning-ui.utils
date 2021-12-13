
import { NumberEqual, StringEqual, BooleanEqual, undefinedEqual, nullEqual, isObject } from ".";
import ObjectUtils from "./ObjectUtils"


class _ArrayUtils {
    /**
     * 数组移位
     * @param array 数组
     * @param from 初始 index 位置
     * @param to 移动至 index 位置
     */
    public arrayMove<T>(array: T[], from: number, to: number): T[] {
        array = array.slice();
        const startIndex = to < 0 ? array.length + to : to;
        const item = array.splice(from, 1)[0];
        array.splice(startIndex, 0, item);
        return array;
    }
    /**
         * 判断两个数组是否相等
         * @param a any[]
         * @param b any[]
         * @returns boolean
         */
    isEqual<T>(a: T[], b: T[]): boolean {

        if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {

            if (a.length === 0 && b.length === 0) return true;

            for (let i = 0; i < a.length; i++) {
                const element = a[i];

                if (Array.isArray(element)) {
                    return this.isEqual(element, b[i] as unknown as T[]);// 数组是否相等
                }

                if (typeof element === "number") {

                    if (isNaN(element as unknown as number) && isNaN(b[1] as unknown as number)) {
                        return true;
                    } else {
                        return NumberEqual(element, b[i]); // 数值是否相等
                    }
                }

                if (typeof element === "string") {
                    return StringEqual(element, b[i]); // 字符串
                }

                if (typeof element === "boolean") {
                    return BooleanEqual(element, b[i]);
                }

                if (typeof element === "undefined") {
                    return undefinedEqual(element, b[i]);
                }

                if (element === null) {
                    return nullEqual(element, b[i]);
                }


                if (isObject(element)) {
                    return ObjectUtils.isEqual(element, b[i]);
                }

                if (i === a.length - 1) {
                    return false
                }
            }
        } else {
            return false
        }
        return false
    }

    /**
     * 数组去重
     */
    unique<T>(arr: T[], key?: string): T[] {
        if(!Array.isArray(arr)) throw new Error("unique 不是一个数组"); 
        
        if (key && typeof key === "string") {
            // let map = new Map();

            // for (let i = 0; i < arr.length; i++) {
            //     let element: { [key: string]: any } = arr[i];
            //     if (!map.has(element[key])) {
            //         map.set(element[key], element);
            //     }
            // }

            // return [...map.values()];
            let set = new Set();
            let _array:T[] = []
            for (let i = 0; i < arr.length; i++) {
                let element: T = arr[i];
                if (!set.has(element[key as keyof typeof element])) {
                    set.add(element[key as keyof typeof element]);
                    _array.push(element as T);
                }
            }
            return _array

        } else {
            return Array.from(new Set(arr));
        }
    }
};

// let _Array:Array<any> = new Array<any>();
export default new _ArrayUtils();