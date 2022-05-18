import Properties, { BPMN_ELEMENTS } from "../constant/Properties";




export type Nodes = { id: any; text?: { value: any; [key: string]: any }; properties?: { [key: string]: any }; type: string | number; [key:string]: any  }[];
export type Edges = { targetId: any; id: any; sourceId: any; text?: { value: any; [key: string]: any }; properties?:  { [key: string]: any }; [key:string]: any }[];
export interface DataProps {
    nodes: Nodes
    edges: Edges
}
interface PropsConstructor {
    DEFAULT_PROCESS_JSON: { // 默认匹配process JSON 数据
        '-id': string,
        '-isExecutable': string,
        [key: string]: any;
    },
    DEFAULT_DIAGRAM_JSON:{ // 默认匹配 diagram JSON 数据
        '-id': string,
        '-bpmnElement': string,
        [key: string]: any
    };
    BPMN_XML_WRAP_TAG: string;
    BPMN_XML_PROCESS: string;
    BPMN_DIAGRAM_DI_TAG: string;
    BPMN_PLANE_DI_TAG: string;
    BPMN_EDGE_DI_TAG: string;
    BPMN_NODE_DI_TAG: string;
}

export default class DataToJson {
    private properties: Properties;
    private constants: PropsConstructor;

    constructor(props: PropsConstructor) {
        this.properties = new Properties();
        this.constants = props;
    }


    // 流程节点 转换 xml json
    public process_conversion_json(data: DataProps) {
        let nodeMap = new Map();
        data.nodes?.forEach((node) => { // data 数据
            // JSON 中所有数据为 - 开头
            const processNode: { [key: string]: any} = {
                '-id': node.id, // 如果是xml的属性，json中属性用'-'开头
            };

            if (node.text?.value) {
                processNode['-name'] = node.text.value;
            }

            if (node.properties) { // 数据拼接
                const properties = this.properties.toJson(node.properties);
                Object.assign(processNode, properties);
            }
            nodeMap.set(node.id, processNode);

            // 查询 json 中是否存在相同的 key 子元素 多个子元素使用 [] , 否则 {}
            if (!this.constants.DEFAULT_PROCESS_JSON[node.type]) { // 如果 是单个子元素
                this.constants.DEFAULT_PROCESS_JSON[node.type] = processNode;
            } else if (Array.isArray(this.constants.DEFAULT_PROCESS_JSON[node.type])) { // // 如果是多个子元素，json中使用数组存储
                this.constants.DEFAULT_PROCESS_JSON[node.type].push(processNode);
            } else {
                console.log(this.constants.DEFAULT_PROCESS_JSON[node.type])
                this.constants.DEFAULT_PROCESS_JSON[node.type] = [
                    this.constants.DEFAULT_PROCESS_JSON[node.type],
                    processNode,
                ]
            }
        });

        // console.log(nodeMap)
        let edgesFlow: { [key: string]: any; }[] = [];
        // 线条
        data.edges?.forEach((edge) => {
            const targetNode = nodeMap.get(edge.targetId);
            let edgeConfig:{
                [key: string]: any
            } = {
                '-id': edge.id,
                '-sourceRef': edge.sourceId,
                '-targetRef': edge.targetId,
            };

            if (!targetNode['bpmn:incoming']) {
                targetNode['bpmn:incoming'] = edge.id;
            } else if (Array.isArray(targetNode['bpmn:incoming'])) {
                targetNode['bpmn:incoming'].push(edge.id);
            } else {
                targetNode['bpmn:incoming'] = [
                    targetNode['bpmn:incoming'],
                    edge.id,
                ];
            }

            const sourceNode = nodeMap.get(edge.sourceId);
            if (!sourceNode['bpmn:outgoing']) {
                sourceNode['bpmn:outgoing'] = edge.id;
            } else if (Array.isArray(sourceNode['bpmn:outgoing'])) {
                sourceNode['bpmn:outgoing'].push(edge.id);
            } else {
                sourceNode['bpmn:outgoing'] = [
                    sourceNode['bpmn:outgoing'],
                    edge.id,
                ];
            }

            if (edge.text?.value) {
                edgeConfig['-name'] = edge.text?.value;
            }

            if (edge.properties) {
                const properties = this.properties.toJson(edge.properties);
                edgeConfig = Object.assign(edgeConfig, properties)

            }
            edgesFlow.push(edgeConfig);
        })

        this.constants.DEFAULT_PROCESS_JSON[BPMN_ELEMENTS.FLOW] = edgesFlow;


        return this.constants.DEFAULT_PROCESS_JSON;
    }



    public diagram_conversion_json(data: { edges: any[]; nodes: any[]; }) {
        this.constants.DEFAULT_DIAGRAM_JSON[this.constants.BPMN_EDGE_DI_TAG] = data.edges?.map(edge => {
            const edgeId = edge.id;
            const pointsList = edge.pointsList.map(({ x, y } : { x: number , y: number }) => ({ '-x': x, '-y': y }));
            const diagramData: {
                [key: string]: any
            } = {
                '-id': `${edgeId}_di`,
                '-bpmnElement': edgeId,
                'di:waypoint': pointsList,
            };
            if (edge.text?.value) {
                diagramData['bpmndi:BPMNLabel'] = {
                    'dc:Bounds': {
                        '-x': edge.text.x - (edge.text.value.length * 10) / 2,
                        '-y': edge.text.y - 7,
                        '-width': edge.text.value.length * 10,
                        '-height': 14,
                    },
                };
            }
            return diagramData;
        })

        

        this.constants.DEFAULT_DIAGRAM_JSON[this.constants.BPMN_NODE_DI_TAG] = data.nodes?.map(node => {
            const nodeId = node.id;
            let width = 100;
            let height = 80;
            let { x, y } = node;
        
            x -= width / 2;
            y -= height / 2;
            const diagramData: { [key: string]: any } = {
                '-id': `${nodeId}_di`,
                '-bpmnElement': nodeId,
                'dc:Bounds': {
                    '-x': x,
                    '-y': y,
                    '-width': width,
                    '-height': height,
                },
            };
            if (node.text?.value) {
                diagramData['bpmndi:BPMNLabel'] = {
                    'dc:Bounds': {
                        '-x': node.text.x - (node.text.value.length * 10) / 2,
                        '-y': node.text.y - 7,
                        '-width': node.text.value.length * 10,
                        '-height': 14,
                    },
                };
            }
            return diagramData;
        }) 

        return this.constants.DEFAULT_DIAGRAM_JSON;
    }
}