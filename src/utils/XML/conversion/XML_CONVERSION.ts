/*
 *	Based on ObjTree.js from
 *	Yusuke Kawasaki http://www.kawa.net/
*/

interface ObjTreeProps {
	attr_prefix?: string; // 此属性允许您指定在每个属性名称之前插入的前缀字符
	overrideMimeType?: "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml"; // 媒体转换类型
}

class XML_CONVERSION {
	private readonly overrideMimeType: string;
	private readonly xmlDecl: string;
	private readonly attr_prefix: string;
	private readonly __force_array: { [key: string]: any };
	private readonly force_array: string[];
	private readonly soft_arrays: any;

	constructor(props?: ObjTreeProps) {
		this.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
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
			let dom = xmldom.parseFromString(xml, this.overrideMimeType as "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml");
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
	private parseDOM(root: any) {
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

	private parseElement(elem: any) {
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
	public writeXML(tree: { [key: string]: any }) {
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

export default XML_CONVERSION;




// import { XML_JSON } from "@learning-ui/utils"
// import { XMLJSON_conversion } from "./config";

	
	// let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:bioc=\"http://bpmn.io/schema/bpmn/biocolor/1.0\" xmlns:color=\"http://www.omg.org/spec/BPMN/non-normative/color/1.0\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n  <bpmn:process id=\"Process_1f897904155e4176a\" isExecutable=\"true\">\n    <bpmn:startEvent id=\"StartEvent_1\" name=\"开始\">\n      <bpmn:outgoing>a777f</bpmn:outgoing>\n    </bpmn:startEvent>\n    <bpmn:userTask id=\"aa3eb\" name=\"action_outputParam_py\">\n <documentation>Schedule an engineering meeting for next week with the new hire.</documentation>  <bpmn:incoming>a777f</bpmn:incoming>\n      <bpmn:outgoing>afed5</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:sequenceFlow id=\"a777f\" sourceRef=\"StartEvent_1\" targetRef=\"aa3eb\" />\n    <bpmn:exclusiveGateway id=\"aed67\" name=\"单一网关\">\n      <bpmn:incoming>afed5</bpmn:incoming>\n      <bpmn:outgoing>a26d6</bpmn:outgoing>\n      <bpmn:outgoing>a6b58</bpmn:outgoing>\n    </bpmn:exclusiveGateway>\n    <bpmn:sequenceFlow id=\"afed5\" sourceRef=\"aa3eb\" targetRef=\"aed67\" />\n    <bpmn:userTask id=\"a2602\">\n      <bpmn:incoming>a26d6</bpmn:incoming>\n      <bpmn:outgoing>aad6c</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:sequenceFlow id=\"a26d6\" name=\"a\" sourceRef=\"aed67\" targetRef=\"a2602\">\n      <bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">${a26d6}</bpmn:conditionExpression>\n    </bpmn:sequenceFlow>\n    <bpmn:task id=\"ae61e\">\n      <bpmn:incoming>a6b58</bpmn:incoming>\n      <bpmn:outgoing>a3f53</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"a6b58\" name=\"b\" sourceRef=\"aed67\" targetRef=\"ae61e\">\n      <bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">${a6b58}</bpmn:conditionExpression>\n    </bpmn:sequenceFlow>\n    <bpmn:parallelGateway id=\"aef0c\" name=\"并行网关\">\n      <bpmn:incoming>a71d6</bpmn:incoming>\n      <bpmn:outgoing>a2cab</bpmn:outgoing>\n      <bpmn:outgoing>a4454</bpmn:outgoing>\n      <bpmn:outgoing>acf31</bpmn:outgoing>\n    </bpmn:parallelGateway>\n    <bpmn:sequenceFlow id=\"aad6c\" sourceRef=\"a2602\" targetRef=\"a3586\" />\n    <bpmn:task id=\"ae271\" name=\"f\">\n      <bpmn:incoming>a2cab</bpmn:incoming>\n      <bpmn:outgoing>ab6e9</bpmn:outgoing>\n    </bpmn:task>\n    <bpmn:sequenceFlow id=\"a2cab\" sourceRef=\"aef0c\" targetRef=\"ae271\" />\n    <bpmn:userTask id=\"ac3ee\" name=\"qew\">\n      <bpmn:incoming>a4454</bpmn:incoming>\n      <bpmn:outgoing>a9791</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:sequenceFlow id=\"a4454\" sourceRef=\"aef0c\" targetRef=\"ac3ee\" />\n    <bpmn:manualTask id=\"a3586\">\n      <bpmn:incoming>aad6c</bpmn:incoming>\n      <bpmn:incoming>a3f53</bpmn:incoming>\n      <bpmn:outgoing>a5d7b</bpmn:outgoing>\n    </bpmn:manualTask>\n    <bpmn:sequenceFlow id=\"a5d7b\" sourceRef=\"a3586\" targetRef=\"a2aba\" />\n    <bpmn:sequenceFlow id=\"a3f53\" sourceRef=\"ae61e\" targetRef=\"a3586\" />\n    <bpmn:userTask id=\"a2aba\" name=\"pwd\">\n      <bpmn:incoming>a5d7b</bpmn:incoming>\n      <bpmn:outgoing>a71d6</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:sequenceFlow id=\"a71d6\" sourceRef=\"a2aba\" targetRef=\"aef0c\" />\n    <bpmn:complexGateway id=\"ac231\" name=\"聚合网关\">\n      <bpmn:incoming>ab6e9</bpmn:incoming>\n      <bpmn:incoming>a9791</bpmn:incoming>\n      <bpmn:incoming>a12a3</bpmn:incoming>\n      <bpmn:outgoing>a5d3f</bpmn:outgoing>\n    </bpmn:complexGateway>\n    <bpmn:sequenceFlow id=\"ab6e9\" sourceRef=\"ae271\" targetRef=\"ac231\" />\n    <bpmn:sequenceFlow id=\"a9791\" sourceRef=\"ac3ee\" targetRef=\"ac231\" />\n    <bpmn:serviceTask id=\"a1251\" name=\"s\">\n      <bpmn:incoming>a5d3f</bpmn:incoming>\n      <bpmn:outgoing>a0f24</bpmn:outgoing>\n    </bpmn:serviceTask>\n    <bpmn:sequenceFlow id=\"a5d3f\" sourceRef=\"ac231\" targetRef=\"a1251\" />\n    <bpmn:endEvent id=\"a0b8b\" name=\"结束\">\n      <bpmn:incoming>a0f24</bpmn:incoming>\n    </bpmn:endEvent>\n    <bpmn:sequenceFlow id=\"a0f24\" sourceRef=\"a1251\" targetRef=\"a0b8b\" />\n    <bpmn:userTask id=\"a3f18\" name=\"4334\">\n      <bpmn:incoming>acf31</bpmn:incoming>\n      <bpmn:outgoing>a12a3</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:sequenceFlow id=\"acf31\" sourceRef=\"aef0c\" targetRef=\"a3f18\" />\n    <bpmn:sequenceFlow id=\"a12a3\" sourceRef=\"a3f18\" targetRef=\"ac231\" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1f897904155e4176a\">\n      <bpmndi:BPMNEdge id=\"a777f_di\" bpmnElement=\"a777f\">\n        <di:waypoint x=\"209\" y=\"120\" />\n        <di:waypoint x=\"260\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"afed5_di\" bpmnElement=\"afed5\">\n        <di:waypoint x=\"360\" y=\"120\" />\n        <di:waypoint x=\"415\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a26d6_di\" bpmnElement=\"a26d6\" bioc:stroke=\"#000000\" color:border-color=\"#000000\">\n        <di:waypoint x=\"465\" y=\"120\" />\n        <di:waypoint x=\"520\" y=\"120\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"490\" y=\"98\" width=\"7\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a6b58_di\" bpmnElement=\"a6b58\" bioc:stroke=\"#000000\" color:border-color=\"#000000\">\n        <di:waypoint x=\"440\" y=\"145\" />\n        <di:waypoint x=\"440\" y=\"230\" />\n        <di:waypoint x=\"520\" y=\"230\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"452\" y=\"181\" width=\"7\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"aad6c_di\" bpmnElement=\"aad6c\">\n        <di:waypoint x=\"620\" y=\"120\" />\n        <di:waypoint x=\"680\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a2cab_di\" bpmnElement=\"a2cab\">\n        <di:waypoint x=\"1055\" y=\"120\" />\n        <di:waypoint x=\"1100\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a4454_di\" bpmnElement=\"a4454\" bioc:stroke=\"#000000\" color:border-color=\"#000000\">\n        <di:waypoint x=\"1030\" y=\"145\" />\n        <di:waypoint x=\"1030\" y=\"240\" />\n        <di:waypoint x=\"1100\" y=\"240\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a5d7b_di\" bpmnElement=\"a5d7b\">\n        <di:waypoint x=\"730\" y=\"120\" />\n        <di:waypoint x=\"790\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a3f53_di\" bpmnElement=\"a3f53\">\n        <di:waypoint x=\"620\" y=\"230\" />\n        <di:waypoint x=\"650\" y=\"230\" />\n        <di:waypoint x=\"650\" y=\"120\" />\n        <di:waypoint x=\"680\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a71d6_di\" bpmnElement=\"a71d6\">\n        <di:waypoint x=\"890\" y=\"120\" />\n        <di:waypoint x=\"1005\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"ab6e9_di\" bpmnElement=\"ab6e9\">\n        <di:waypoint x=\"1200\" y=\"120\" />\n        <di:waypoint x=\"1245\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a9791_di\" bpmnElement=\"a9791\">\n        <di:waypoint x=\"1200\" y=\"240\" />\n        <di:waypoint x=\"1270\" y=\"240\" />\n        <di:waypoint x=\"1270\" y=\"145\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a5d3f_di\" bpmnElement=\"a5d3f\">\n        <di:waypoint x=\"1295\" y=\"120\" />\n        <di:waypoint x=\"1330\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a0f24_di\" bpmnElement=\"a0f24\">\n        <di:waypoint x=\"1430\" y=\"120\" />\n        <di:waypoint x=\"1472\" y=\"120\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"acf31_di\" bpmnElement=\"acf31\">\n        <di:waypoint x=\"1030\" y=\"145\" />\n        <di:waypoint x=\"1030\" y=\"350\" />\n        <di:waypoint x=\"1100\" y=\"350\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id=\"a12a3_di\" bpmnElement=\"a12a3\">\n        <di:waypoint x=\"1200\" y=\"350\" />\n        <di:waypoint x=\"1270\" y=\"350\" />\n        <di:waypoint x=\"1270\" y=\"145\" />\n      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\">\n        <dc:Bounds x=\"173\" y=\"102\" width=\"36\" height=\"36\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"aa3eb_di\" bpmnElement=\"aa3eb\">\n        <dc:Bounds x=\"260\" y=\"80\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"aed67_di\" bpmnElement=\"aed67\" isMarkerVisible=\"true\">\n        <dc:Bounds x=\"415\" y=\"95\" width=\"50\" height=\"50\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"418\" y=\"71\" width=\"44\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a2602_di\" bpmnElement=\"a2602\">\n        <dc:Bounds x=\"520\" y=\"80\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"ae61e_di\" bpmnElement=\"ae61e\">\n        <dc:Bounds x=\"520\" y=\"190\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a3586_di\" bpmnElement=\"a3586\">\n        <dc:Bounds x=\"680\" y=\"95\" width=\"50\" height=\"50\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"aef0c_di\" bpmnElement=\"aef0c\">\n        <dc:Bounds x=\"1005\" y=\"95\" width=\"50\" height=\"50\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"1008\" y=\"71\" width=\"44\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a2aba_di\" bpmnElement=\"a2aba\">\n        <dc:Bounds x=\"790\" y=\"80\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"ae271_di\" bpmnElement=\"ae271\">\n        <dc:Bounds x=\"1100\" y=\"80\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"ac3ee_di\" bpmnElement=\"ac3ee\">\n        <dc:Bounds x=\"1100\" y=\"200\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"ac231_di\" bpmnElement=\"ac231\">\n        <dc:Bounds x=\"1245\" y=\"95\" width=\"50\" height=\"50\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"1248\" y=\"71\" width=\"44\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a1251_di\" bpmnElement=\"a1251\">\n        <dc:Bounds x=\"1330\" y=\"80\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a0b8b_di\" bpmnElement=\"a0b8b\">\n        <dc:Bounds x=\"1472\" y=\"102\" width=\"36\" height=\"36\" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x=\"1479\" y=\"141\" width=\"22\" height=\"14\" />\n        </bpmndi:BPMNLabel>\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id=\"a3f18_di\" bpmnElement=\"a3f18\">\n        <dc:Bounds x=\"1100\" y=\"310\" width=\"100\" height=\"80\" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>\n"


// let xml_html = new XMLJSON_conversion({});
// let data = xml_html.toData(xml_html.parseXML(xml));
// console.log(xml_html, xml_html.toXml(data))


// export default {};