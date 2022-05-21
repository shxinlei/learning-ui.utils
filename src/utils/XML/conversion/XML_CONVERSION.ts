/*
 *	Based on ObjTree.js from
 *	Yusuke Kawasaki http://www.kawa.net/
 */


interface ObjTreeProps {
	attr_prefix?: string; // 此属性允许您指定在每个属性名称之前插入的前缀字符
	overrideMimeType?:
	| 'application/xhtml+xml'
	| 'application/xml'
	| 'image/svg+xml'
	| 'text/html'
	| 'text/xml'; // 媒体转换类型
}

class XML_CONVERSION {
	private readonly overrideMimeType: string;

	private readonly attr_prefix: string;
	private __force_array: { [key: string]: any };
	private readonly force_array: string[];
	private readonly soft_arrays: any;

	constructor(props?: ObjTreeProps) {
		this.attr_prefix = props?.attr_prefix || '-';
		this.overrideMimeType = props?.overrideMimeType || 'application/xml';
		this.__force_array = {};
		this.force_array = [];
	}

	// 此方法使用提供的字符串加载 XML 文档，并返回其转换后的 JavaScript 对象。
	public parseXML(xml: string) {
		let root;
		if (window.DOMParser) {
			let xmldom = new DOMParser();
			let dom = xmldom.parseFromString(
				xml,
				this.overrideMimeType as
				| 'application/xhtml+xml'
				| 'application/xml'
				| 'image/svg+xml'
				| 'text/html'
				| 'text/xml'
			);
			if (!dom) return;
			root = dom.documentElement;
		} else if (window.ActiveXObject) {
			// 查询 DOMParser 不存在的时候使用 主要是在IE 不是 9 的时候
			let xmldom = new ActiveXObject('Microsoft.XMLDOM');
			xmldom.async = false;
			xmldom.loadXML(xml);
			root = xmldom.documentElement;
		} else {
			throw new Error('window.DOMParser does not exist');
		}

		if (!root) return;
		return this.parseDOM(root);
	}

	// 此方法解析 DOM 树（例如 responseXML.documentElement）并返回其转换后的 JavaScript 对象。
	private parseDOM(root: any) {
		if (!root) return;
		this.__force_array = {};
		if (this.force_array.length) {
			for (let i = 0; i < this.force_array.length; i++) {
				this.__force_array[this.force_array[i]] = 1;
			}
		}

		let json = this.parseElement(root); // 解析节点
		if (this.__force_array[root.nodeName]) {
			json = [json];
		}

		if (root.nodeType !== 11) {
			// 文档片段节点
			let tmp: { [key: string]: any } = {};
			tmp[root.nodeName] = json; // 根节点名称
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

	private parseElement(elem: any) {
		if (elem.nodeType === 7) {
			return;
		}
		//  text 节点node 判断
		if (elem.nodeType === 3 || elem.nodeType === 4) {
			let bool = elem.nodeValue.match(/[^\x00-\x20]/);
			if (bool === null) return; // ignore white spaces
			return elem.nodeValue;
		}
		let retValue;
		let cnt: { [key: string]: any } = {};

		//  解析属性
		if (elem.attributes && elem.attributes.length) {
			retValue = {};
			for (let i = 0; i < elem.attributes.length; i++) {
				let key = elem.attributes[i].nodeName;
				if (typeof key !== 'string') continue;
				let val = elem.attributes[i].nodeValue;
				if (!val) continue;
				key = this.attr_prefix + key;
				if (typeof cnt[key] === 'undefined') cnt[key] = 0;
				cnt[key]++;
				this.addNode(retValue, key, cnt[key], val);
			}
		}

		//  解析子元素节点 (recursive)
		if (elem.childNodes && elem.childNodes.length) {
			let textOnly = true;
			if (retValue) textOnly = false; // some attributes exists
			for (let i = 0; i < elem.childNodes.length && textOnly; i++) {
				let nodeType = elem.childNodes[i].nodeType;
				if (nodeType === 3 || nodeType === 4) continue;
				textOnly = false;
			}
			if (textOnly) {
				if (!retValue) retValue = '';
				for (let i = 0; i < elem.childNodes.length; i++) {
					retValue += elem.childNodes[i].nodeValue;
				}
			} else {
				if (!retValue) retValue = {};
				for (let i = 0; i < elem.childNodes.length; i++) {
					let key = elem.childNodes[i].nodeName;
					if (typeof key !== 'string') continue;
					let val = this.parseElement(elem.childNodes[i]);
					if (!val) continue;
					if (typeof cnt[key] === 'undefined') cnt[key] = 0;
					cnt[key]++;
					this.addNode(retValue, key, cnt[key], val);
				}
			}
		}
		return retValue;
	}

	private addNode(
		hash: { [x: string]: any },
		key: string,
		cnts: number,
		val: any
	) {
		if (this.__force_array[key]) {
			if (cnts === 1) hash[key] = [];
			hash[key][hash[key].length] = val; // push
		} else if (cnts === 1) {
			// 1st sibling
			hash[key] = val;
		} else if (cnts === 2) {
			// 2nd sibling
			hash[key] = [hash[key], val];
		} else {
			// 3rd sibling and more
			hash[key][hash[key].length] = val;
		}
	}

	public writeXML(o: { [key: string]: any }) {
		let xmlStr = "";
		for (let m in o) {
			xmlStr += this.toXml(o[m], m, "\t\n", 0);
		}
		return xmlStr;
	}

	private toXml(v: any , name: string, ind: string , deep: number) {
		let xml = "";
		if (v instanceof Array) {
			for (let i = 0, n = v.length; i < n; i++) {
				xml += this.addIndSpace(ind, deep) + this.toXml(v[i], name, ind, deep + 1);
			}
		}
		else if (typeof (v) == "object") {
			let hasChild = false;
			xml += this.addIndSpace(ind, deep) + "<" + name;
			for (let m in v) {
				if (m.charAt(0) == "-")
					xml += " " + m.substring(1) + "=\"" + v[m].toString() + "\"";
				else
					hasChild = true;
			}
			xml += hasChild ? ">" : " />";
			if (hasChild) {
				for (let m in v) {
					if (m == "#text")
						xml += v[m];
					else if (m == "#cdata")
						xml += "<![CDATA[" + v[m] + "]]>";
					else if (m.charAt(0) != "-")
						xml += this.toXml(v[m], m, ind, deep + 1);
				}
				xml += this.addIndSpace(ind, deep) + "</" + name + ">";
			}
		}
		else {
			xml += this.addIndSpace(ind, deep) + "<" + name + ">" + v + "</" + name + ">";
		}
		return xml;
	}

	private addIndSpace(ind: string, deep: number) {
		for (let i = 0; i < deep; i++) {
			ind += '  ';
		}
		return ind;
	}
}

export default XML_CONVERSION;
