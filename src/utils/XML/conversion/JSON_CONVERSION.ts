import JsonToData from "./JsonToData";
import { BPMN_ELEMENTS } from "./constant/Properties";
import DataToJson, { DataProps , Nodes , Edges } from "./DataToJson";
import { uuid } from "../..";



// xml 信息
/**
 * <bpmn:definitions>
 *    <bpmn:process>
 *      用户节点 / 网关 以及 线条
 *       <bpmn:userTask></bpmn:userTask>
 *       <bpmn:sequenceFlow />
 *        ....
 *    </bpmn:process>
 *    <bpmndi:BPMNDiagram>
 *        <bpmndi:BPMNPlane>
 *            // 其中有两种展现方式
 *              1. <bpmndi:BPMNEdge></bpmndi:BPMNEdge> 属于是线条类型
 *              2. <bpmndi:BPMNShape></bpmndi:BPMNShape> 属于是 node 节点
 *        </bpmndi:BPMNPlane>
 *    </bpmndi:BPMNDiagram>
 * </bpmn:definitions>
 */


// bpmnJSON 格式
/**
 * bpmnXml = { 
 * "bpmn:definitions": {
 * 
 *      bpmn:process: {
 *        -id: "",
 *        -isExecutable: boolean
 *        
 *        // 如果只为单独的一个节点 为 Map 对象
 *        bpmn:startEvent: {},
 *        bpmn:endEvent: {},
 *        
 *        // 节点类型都是 数组
 *        bpmn:task: [], or bpmn:task: {}
 *        bpmn:userTask: [],
 * 		  bpmn:sequenceFlow: [],// 线条
 *      },
 *    
 *      bpmndi:BPMNDiagram: {
 *        bpmndi:BPMNEdge: [], // 线条
 *        bpmndi:BPMNShape: [],// 节点
 *      }
 * 
 * }}
 * 
 */

class JSON_CONVERSION {
	private BPMN_XML_WRAP_TAG = "bpmn:definitions"; // 根节点
	private BPMN_XML_PROCESS = "bpmn:process"; // process 流程画板
	private BPMN_DIAGRAM_DI_TAG = 'bpmndi:BPMNDiagram'; // 数据画布信息
	private BPMN_PLANE_DI_TAG = "bpmndi:BPMNPlane"; // 数据画布中的画板
	private BPMN_EDGE_DI_TAG = "bpmndi:BPMNEdge"; // 数据画板中的线条信息
	private BPMN_NODE_DI_TAG = 'bpmndi:BPMNShape'; // 数据画板中的节点信息

	private DEFAULT_PROCESS_JSON = { // 默认匹配process JSON 数据
		'-id': `Process_${uuid()}`,
		'-isExecutable': 'false',
	};
	private DEFAULT_DIAGRAM_JSON = { // 默认匹配 diagram JSON 数据
		'-id': 'BPMNPlane_1',
		'-bpmnElement': this.DEFAULT_PROCESS_JSON['-id'],
	};
	
	private nodes: Nodes;
	private edges: Edges;
	private JSON_ToData: JsonToData;
	private DATA_ToJson: DataToJson;

	constructor() {
		this.nodes = [];
		this.edges = [];
		this.JSON_ToData = new JsonToData();
		this.DATA_ToJson = new DataToJson({
			DEFAULT_DIAGRAM_JSON: this.DEFAULT_DIAGRAM_JSON,
			DEFAULT_PROCESS_JSON: this.DEFAULT_PROCESS_JSON,
			BPMN_XML_WRAP_TAG: this.BPMN_XML_WRAP_TAG,
			BPMN_XML_PROCESS: this.BPMN_XML_PROCESS,
			BPMN_EDGE_DI_TAG: this.BPMN_EDGE_DI_TAG,
			BPMN_NODE_DI_TAG: this.BPMN_NODE_DI_TAG,
			BPMN_DIAGRAM_DI_TAG: this.BPMN_DIAGRAM_DI_TAG,
			BPMN_PLANE_DI_TAG: this.BPMN_PLANE_DI_TAG,

		});
	}

	// 将bpmnJSON 转为数据 XMLJSON => data; 
	public toData(bpmnXmlJson: { [x: string]: any; }) {
		const definitions = bpmnXmlJson[this.BPMN_XML_WRAP_TAG];

		if (definitions) { // 如果传入的是 bpmnXML 必定是有defintions
			// 获取到 process 的 json 数据
			let process = definitions[this.BPMN_XML_PROCESS];

			// 根据可以拿到 process 中的所有数据
			Object.keys(process).forEach(key => {
				if (key.indexOf("bpmn:") > -1) { // 必须是 bpmn 规范的节点
					let processValue = process[key];
					// 如果 process 中的key 是bpmn 线条的tag 的时候
					if (key === BPMN_ELEMENTS.FLOW) {
						// 拿到线条类型
						/**
						 * key = bpmn:sequenceFlow
						 */
						const bpmnDiEdges = definitions[this.BPMN_DIAGRAM_DI_TAG][this.BPMN_PLANE_DI_TAG][this.BPMN_EDGE_DI_TAG];
						/**
						*	processValue = bpmn:sequenceFlow = any[]
						* 	bpmnEdges = bpmndi:BPMNDiagram["bpmndi:BPMNEdge"] = [] 
						*/
						this.edges = this.JSON_ToData.xmlToEdge.getEdges(processValue, bpmnDiEdges) as any;
					} else { // 不是线条的时候
						const bpmnDiNode = definitions[this.BPMN_DIAGRAM_DI_TAG][this.BPMN_PLANE_DI_TAG][this.BPMN_NODE_DI_TAG];
						this.nodes = this.nodes.concat(this.JSON_ToData.xmlToNode.getNodes(processValue, bpmnDiNode, key));
					}
				}
			})
		}
		return {
			nodes: this.nodes,
			edges: this.edges,
		}
	}

	public toJSON(data: DataProps) {
		
		const DEFAULT_PROCESS_JSON = this.DATA_ToJson.process_conversion_json(data);
		const DEFAULT_DIAGRAM_JSON = this.DATA_ToJson.diagram_conversion_json(data);
		let definitionsId = uuid();
		return {
			'bpmn:definitions': {
				'-id': `Definitions_${definitionsId}`,
				"-targetNamespace": "http://bpmn.io/schema/bpmn",
				"-xmlns:bioc": "http://bpmn.io/schema/bpmn/biocolor/1.0",
				"-xmlns:bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
				"-xmlns:bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
				"-xmlns:color": "http://www.omg.org/spec/BPMN/non-normative/color/1.0",
				"-xmlns:dc": "http://www.omg.org/spec/DD/20100524/DC",
				'-xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
				'bpmn:process': DEFAULT_PROCESS_JSON,
				'bpmndi:BPMNDiagram': {
					'-id': `BPMNDiagram_${definitionsId}`,
					'bpmndi:BPMNPlane': DEFAULT_DIAGRAM_JSON,
				},
			}
		}

	}
}
export default JSON_CONVERSION;