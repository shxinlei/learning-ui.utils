import Properties from "./Properties";
import {BPMNShape} from "./index";





export default class NodeConfig extends BPMNShape {
    private DEFAULT_ELEMENT: any;
    private DEFAULT_ATTRS: any;
    private properties: Properties;

    constructor(props:any){
        super();
        this.DEFAULT_ELEMENT = props.DEFAULT_ELEMENT;
        this.DEFAULT_ATTRS = props.DEFAULT_ATTRS;
        this.properties = new Properties();
    }

    /**
     *
     * @param processValue process 节点中的 bpmn 节点值
     * @param bpmnDiNode
     * @param processKey
     */
    public getNodes<T>(processValue: T[] | any, bpmnDiNode: T[] | any, processKey: string): any[] {
        const nodes = [];

        // 两种体现方式 1. { } 2. []
        if (Array.isArray(processValue)) {
            processValue.forEach(item => {
                let diNode;
                // 如果为数组的时候
                if (Array.isArray(bpmnDiNode)) {
                    let di_id = this.DEFAULT_ELEMENT.di.id;
                    let process_id = this.DEFAULT_ELEMENT.process.id;
                    diNode = bpmnDiNode.find(node => node[di_id] === item[process_id]); // 如果是数组查询 di 中的那一项
                } else {
                    diNode = bpmnDiNode;
                }

                const node = this.getNodeConfig(diNode, processKey, item);
                nodes.push(node)
            });
        } else {
            let diNode;
            if (Array.isArray(bpmnDiNode)) {
                let di_id = this.DEFAULT_ELEMENT.di.id;
                let process_id = this.DEFAULT_ELEMENT.process.id;
                diNode = bpmnDiNode.find(node => node[di_id] === processValue[process_id]); // 如果是数组查询 di 中的那一项
            } else {
                diNode = bpmnDiNode;
            }

            const node = this.getNodeConfig(diNode, processKey, processValue);
            nodes.push(node);
        }
        return nodes;
    }

    /**
     * @param diNode
     * @param processKey process 中每一项的 key
     * @param processNodeItem di
     */
     private getNodeConfig(diNode: { [x: string]: any; }, processKey: string, processNodeItem: { [s: string]: any; } | ArrayLike<unknown> | any ) {
        // console.log(diNode, processKey, processNodeItem);

        // 获取 元素的 x 和 y
        let x = Number(diNode[this.DEFAULT_ELEMENT.di.bounds]['-x']);
        let y = Number(diNode[this.DEFAULT_ELEMENT.di.bounds]['-y']);
        let name = processNodeItem[this.DEFAULT_ATTRS["-name"]]
        const shapeConfig = this.BPMNShape.get(processKey);
        if (shapeConfig) {
            x += shapeConfig.width / 2;
            y += shapeConfig.height / 2;
        }
        // 自定义属性
        let properties: any;
        Object.entries(processNodeItem).forEach(([key, value]) => {
            if (!this.DEFAULT_ATTRS[key]) {
                if (!properties) properties = {};
                properties[key] = value;
            }
        });

        if (properties) {
            properties = this.properties.toJson(properties);
        }

        let text;
        if (name) {
            text = {
                x,
                y,
                value: name,
            };
            let diLabel = diNode[this.DEFAULT_ELEMENT.di.label];
            let textPosition = diLabel && diLabel[this.DEFAULT_ELEMENT.di.bounds];

            // console.log(diLabel && diLabel[this.DEFAULT_ELEMENT.di.bounds]);

            // 自定义文本位置
            if (textPosition) {
                text.x = Number(textPosition['-x']) + Number(textPosition['-width']) / 2;
                text.y = Number(textPosition['-y']) + Number(textPosition['-height']) / 2;
            }
        }


        const node: any = {
            id: diNode[this.DEFAULT_ELEMENT.di.id],
            x: x,
            y: y,
            type: processKey,
            properties,
            
        }
        if(text){
            node.text = text;
        }
        return node
    }

}
