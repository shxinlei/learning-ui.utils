import EdgeConfig from "../constant/EdgeConfig";
import NodeConfig from "../constant/NodeCongig";
import { BPMN_ELEMENTS } from "../constant/Properties";






export default class JsonToData {
    public xmlToNode: NodeConfig;
    public xmlToEdge: EdgeConfig;

	// 默认的 xml 元素信息
	private DEFAULT_ELEMENT = {
		process: {
			id: "-id",
		},
		di: {
			id: "-bpmnElement",
			label: "bpmndi:BPMNLabel",
			bounds: 'dc:Bounds',
			waypoint: "di:waypoint"
		}
	}

    // 默认的 xml 属性信息
	private DEFAULT_ATTRS = {
		'-name': '-name',
		'-id': '-id',
		'-sourceRef': '-sourceRef',
		'-targetRef': '-targetRef',
		'bpmn:incoming': 'bpmn:incoming',
		'bpmn:outgoing': 'bpmn:outgoing',
	}


    constructor(){
        this.xmlToNode = new NodeConfig({ DEFAULT_ELEMENT: this.DEFAULT_ELEMENT, DEFAULT_ATTRS: this.DEFAULT_ATTRS });
        this.xmlToEdge = new EdgeConfig({ DEFAULT_ELEMENT: this.DEFAULT_ELEMENT, DEFAULT_ATTRS: this.DEFAULT_ATTRS,BPMN_ELEMENTS: BPMN_ELEMENTS });
    }
}