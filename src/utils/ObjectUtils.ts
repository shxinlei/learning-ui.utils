import { isObject, NumberEqual, StringEqual, BooleanEqual, undefinedEqual, nullEqual } from "."
import ArrayUtils from "./ArrayUtils";


class ObjectUtils {
    /**
     * 数据对比
     * @param a { [key: string]: any | any[] }[]
     * @param b {[key: string]: any | any[] }[])
     * @returns boolean
     */
    isEqual(a: { [key: string]: any | any[] }[] | any, b: { [key: string]: any | any[] }[] | any): boolean {


        if (isObject(a) && isObject(b)) {

            if(Object.keys(a).length === 0 && Object.keys(b).length === 0) return true;

            if (Object.keys(a).length !== Object.keys(b).length) return false; // 如果key 长度不等 返回false

            let _object = a;

            let flag: any = [];

            for (const key in _object) {

                if (Object.hasOwnProperty.call(_object, key)) {

                    if (Array.isArray(_object[key])) {
                        flag.push(ArrayUtils.isEqual(_object[key] as any[], b[key] as unknown as any[]))// 数组是否相等
                    }

                    if (typeof _object[key] === "number") {

                        if(isNaN(_object[key] as unknown as number) && isNaN(b[key] as unknown as number)){

                            flag.push(true);
                        }else {

                            flag.push(NumberEqual(_object[key], b[key])); // 数值是否相等
                        }

                    }

                    if (typeof _object[key] === "string") {
                        flag.push(StringEqual(_object[key], b[key])); // 字符串
                    }

                    if (typeof _object[key] === "boolean") {
                        flag.push(BooleanEqual(_object[key], b[key]))
                    }

                    if (typeof _object[key] === "undefined" && key) {
                        flag.push(undefinedEqual(_object[key], b[key]))
                    }

                    if (_object[key] === null) {
                        flag.push(nullEqual(_object[key], b[key]))
                    }


                    if (isObject(_object[key])) {
                        flag.push(this.isEqual(_object[key] as any, b[key] as unknown as any))
                    }

                    if (flag.includes(false)) {
                        return false;
                    }

                    if (flag.length === Object.keys(a).length && !flag.includes(false)) {
                        return true
                    }

                }
            }

            return false;
        } else {
            return false;
        }
    }
}
    


export default new ObjectUtils();
