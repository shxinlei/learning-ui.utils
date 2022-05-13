/*
 *	Based on ObjTree.js from
 *	Yusuke Kawasaki http://www.kawa.net/
 *
*/

// If running in Node.js, need package library 'xmldom'.
// Provides the DOMParser object. Everything else stays the same!
interface ObjTreeProps {
    attr_prefix?: string; // 此属性允许您指定在每个属性名称之前插入的前缀字符
    overrideMimeType?: "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml"; // 媒体转换类型
}

class XML_JSON {
    private readonly overrideMimeType: string;
    private readonly xmlDecl: string;
    private readonly attr_prefix: string;
    private readonly __force_array: { [key: string]: any };
    private readonly force_array: string[];
    private readonly soft_arrays: any;

    constructor(props: ObjTreeProps) {
        this.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
        this.attr_prefix = props?.attr_prefix || '-';
        this.overrideMimeType = props?.overrideMimeType || 'application/xml';
        this.__force_array = {};
        this.force_array = [];
    }


    // 此方法使用提供的字符串加载 XML 文档，并返回其转换后的 JavaScript 对象。
    parseXML(xml: string) {
        let root;
        if (window.DOMParser) {
            let xmldom = new DOMParser();
            let dom = xmldom.parseFromString(xml, <"application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml">this.overrideMimeType);
            if (!dom) return;
            root = dom.documentElement;
        } else if (window.ActiveXObject) {
            // 查询 DOMParser 不存在的时候使用 主要是在IE 不是 9 的时候
            let xmldom = new ActiveXObject('Microsoft.XMLDOM');
            xmldom.async = false;
            xmldom.loadXML(xml);
            root = xmldom.documentElement;
        } else {
            throw new Error("window.DOMParser does not exist")
        }

        if (!root) return;
        return this.parseDOM(root);
    }

    // 此方法解析 DOM 树（例如 responseXML.documentElement）并返回其转换后的 JavaScript 对象。
    parseDOM(root: any) {
        if (!root) return;
        if (this.force_array.length) {
            for (let i = 0; i < this.force_array.length; i++) {
                this.__force_array[this.force_array[i]] = 1;
            }
        }

        let json = this.parseElement(root);   // 解析节点
        if (this.__force_array[root.nodeName]) {
            json = [json];
        }

        if (root.nodeType !== 11) {            // 文档片段节点
            let tmp: { [key: string]: any } = {};
            tmp[root.nodeName] = json;          // 根节点名称
            json = tmp;
        }

        if (this.soft_arrays) {
            let augmentObject = function (obj: string | any[]) {
                if (typeof obj !== 'string') {
                    for (let property in obj) {
                        augmentObject(obj[property]);
                    }
                    if (!obj.length) {
                        obj.length = 1;
                        obj[0] = obj;
                    }
                }
            };
            augmentObject(json);
        }

        return json;
    }

    parseElement(elem: any) {
        if (elem.nodeType === 7) {
            return;
        }
        //  text 节点node 判断
        if (elem.nodeType === 3 || elem.nodeType === 4) {
            let bool = elem.nodeValue.match(/[^\x00-\x20]/);
            if (bool === null) return;     // ignore white spaces
            return elem.nodeValue;
        }
        let retValue;
        let cnt: { [key: string]: any } = {};

        //  解析属性
        if (elem.attributes && elem.attributes.length) {
            retValue = {};
            for (let i = 0; i < elem.attributes.length; i++) {
                let key = elem.attributes[i].nodeName;
                if (typeof (key) !== "string") continue;
                let val = elem.attributes[i].nodeValue;
                if (!val) continue;
                key = this.attr_prefix + key;
                if (typeof (cnt[key]) === "undefined") cnt[key] = 0;
                cnt[key]++;
                this.addNode(retValue, key, cnt[key], val);
            }
        }

        //  解析子元素节点 (recursive)
        if (elem.childNodes && elem.childNodes.length) {
            let textOnly = true;
            if (retValue) textOnly = false;        // some attributes exists
            for (let i = 0; i < elem.childNodes.length && textOnly; i++) {
                let nodeType = elem.childNodes[i].nodeType;
                if (nodeType === 3 || nodeType === 4) continue;
                textOnly = false;
            }
            if (textOnly) {
                if (!retValue) retValue = "";
                for (let i = 0; i < elem.childNodes.length; i++) {
                    retValue += elem.childNodes[i].nodeValue;
                }
            } else {
                if (!retValue) retValue = {};
                for (let i = 0; i < elem.childNodes.length; i++) {
                    let key = elem.childNodes[i].nodeName;
                    if (typeof (key) !== "string") continue;
                    let val = this.parseElement(elem.childNodes[i]);
                    if (!val) continue;
                    if (typeof (cnt[key]) === "undefined") cnt[key] = 0;
                    cnt[key]++;
                    this.addNode(retValue, key, cnt[key], val);
                }
            }
        }
        return retValue;
    }

    private addNode(hash: { [x: string]: any; }, key: string, cnts: number, val: any) {
        if (this.__force_array[key]) {
            if (cnts === 1) hash[key] = [];
            hash[key][hash[key].length] = val;      // push
        } else if (cnts === 1) {                   // 1st sibling
            hash[key] = val;
        } else if (cnts === 2) {                   // 2nd sibling
            hash[key] = [hash[key], val];
        } else {                                    // 3rd sibling and more
            hash[key][hash[key].length] = val;
        }
    }

    // 此方法分析 JavaScript 对象树并返回其生成的 XML 源。
    writeXML(tree: { [key: string]: any }) {
        let xml = this.hash_to_xml(null, tree);
        return this.xmlDecl + xml;
    }


    private hash_to_xml(name: string | null, tree: { [x: string]: any; }) {
        let element = [];
        let attr = [];
        for (let key in tree) {
            if (!tree.hasOwnProperty(key)) continue;
            let val = tree[key];
            if (key.charAt(0) !== this.attr_prefix) {
                if (typeof (val) === "undefined" || val === null) {
                    element[element.length] = "<" + key + " />";
                } else if (typeof (val) === "object" && val.constructor === Array) {
                    element[element.length] = this.array_to_xml(key, val);
                } else if (typeof (val) === "object") {
                    element[element.length] = this.hash_to_xml(key, val);
                } else {
                    element[element.length] = this.scalar_to_xml(key, val);
                }
            } else {
                attr[attr.length] = " " + (key.substring(1)) + '="' + (this.xml_escape(val)) + '"';
            }
        }

        let tagAttr = attr.join("");
        let tagElement: string = element.join("");
        if (name && name.trim()) {
            if (element.length > 0) {
                if (tagElement.match(/\n/)) {
                    tagElement = "<" + name + tagAttr + ">\n" + tagElement + "</" + name + ">\n";
                } else {
                    tagElement = "<" + name + tagAttr + ">" + tagElement + "</" + name + ">\n";
                }
            } else {
                tagElement = "<" + name + tagAttr + " />\n";
            }
        }
        return tagElement;
    }


    private array_to_xml(name: string, array: string | any[]) {
        let out: string[] = [];
        for (let i = 0; i < array.length; i++) {
            let val = array[i];
            if (typeof (val) === "undefined" || val === null) {
                out[out.length] = "<" + name + " />";
            } else if (typeof (val) === "object" && val.constructor === Array) {
                out[out.length] = this.array_to_xml(name, val);
            } else if (typeof (val) === "object") {
                out[out.length] = this.hash_to_xml(name, val);
            } else {
                out[out.length] = this.scalar_to_xml(name, val);
            }
        }
        return out.join("");
    }

    private scalar_to_xml(name: string, text: any) {
        if (name === "#text") {
            return this.xml_escape(text);
        } else {
            return "<" + name + ">" + this.xml_escape(text) + "</" + name + ">\n";
        }
    }

    //  method: xml_escape( text )
    private xml_escape(text: any) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

export default XML_JSON;



