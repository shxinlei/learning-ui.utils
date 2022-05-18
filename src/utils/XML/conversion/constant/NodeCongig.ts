import Properties from "./Properties";





export default class NodeConfig {
    private DEFAULT_ELEMENT: any;
    private DEFAULT_ATTRS: any;
    private properties: Properties;


    constructor(props: { DEFAULT_ELEMENT: any; DEFAULT_ATTRS: any; }){
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

        let text = {} as any;
        let name = processNodeItem[this.DEFAULT_ATTRS["-name"]]

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


        if (name) {

            let diLabel = diNode[this.DEFAULT_ELEMENT.di.label];
            let textPosition = diLabel && diLabel[this.DEFAULT_ELEMENT.di.bounds];

            // console.log(diLabel && diLabel[this.DEFAULT_ELEMENT.di.bounds]);

            // 自定义文本位置
            if (textPosition) {
                //  console.log( textPosition)
                text.x = Number(textPosition['-x']) + Number(textPosition['-width']) / 2;
                text.y = Number(textPosition['-y']) + Number(textPosition['-height']) / 2;
            }

            text = {
                ...text,
                value: name,
            };
        }


        return {
            id: diNode[this.DEFAULT_ELEMENT.di.id],
            x: x,
            y: y,
            type: processKey,
            properties,
            text: { ...text }
        }
    }

}
