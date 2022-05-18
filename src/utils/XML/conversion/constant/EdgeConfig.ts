import Properties from "./Properties";


export default class EdgeConfig {
    private DEFAULT_ELEMENT: any;
    private DEFAULT_ATTRS: any;
    private properties: any;
    private BPMN_ELEMENTS: any;



    constructor(props: { DEFAULT_ELEMENT: any; DEFAULT_ATTRS: any; BPMN_ELEMENTS: any; }){
        this.DEFAULT_ELEMENT = props.DEFAULT_ELEMENT;
        this.DEFAULT_ATTRS = props.DEFAULT_ATTRS;
        this.BPMN_ELEMENTS = props.BPMN_ELEMENTS;
        this.properties = new Properties();
    }


	/**
	 * @param processValue process 中的流程信息
	 * @param bpmnDiEdges
	 */
     public getEdges(processValue: any[], bpmnDiEdges: any[]) {
		const edges = [];

		if (Array.isArray(processValue)) { // 寻找到 

			processValue.forEach(item => {
				let edgeObj; // 拿取 BPMN 中的单个线条信息
				// 单个线条信息为 map 多个线条信息为 List
				if (Array.isArray(bpmnDiEdges)) {
					// -bpmnElement 属于 在 bpmn:process中的 bpmn:sequenceFlow 中对应的 -id
					let di_id = this.DEFAULT_ELEMENT.di.id;
					let process_id = this.DEFAULT_ELEMENT.process.id;
					// 拿到 process 中对应的线条信息
					edgeObj = bpmnDiEdges.find(edge => edge[di_id] === item[process_id]);
				} else {
					edgeObj = bpmnDiEdges;
				}
				// 单个的线条信息 以及 
				edges.push(this.getEdgeConfig(edgeObj, item));
			})
		} else { // 当是对象的时候
			let edgeObj;
			if (Array.isArray(bpmnDiEdges)) {
				// -bpmnElement 属于 在 bpmn:process中的 bpmn:sequenceFlow 中对应的 -id
				let di_id = this.DEFAULT_ELEMENT.di.id;
				let process_id = this.DEFAULT_ELEMENT.process.id;
				// 拿到 process 中对应的线条信息
				edgeObj = bpmnDiEdges.find(edge => edge[di_id] === processValue[process_id]);
			} else {
				edgeObj = bpmnDiEdges;
			}
			edges.push(this.getEdgeConfig(edgeObj, processValue));
		}

		return edges;
	}


	// 每一条线条的处理
	/**
	 * @param diEdgeValue
	 * @param processEdgeValue
	 */
	private getEdgeConfig(diEdgeValue: { [x: string]: any[]; }, processEdgeValue: any) {
		let text, properties: any;
		// 流程的 name 属性
		const textValue = processEdgeValue[this.DEFAULT_ATTRS["-name"]];
		if (textValue) {
			// bpmndi:BPMNLabel 中的 Bounds 的信息 
			const textBounds = diEdgeValue[this.DEFAULT_ELEMENT.di.label][this.DEFAULT_ELEMENT.di.bounds];
			let textLength = 0;
			textValue.split("\n").forEach((text: string | any[]) => {
				if (textLength < text.length) {
					textLength = text.length;
				}
			})

			// 如果 不使用number 转换 会出现部分偏移现象
			text = {
				value: textValue, // 线条的 文本信息 process 中的name
				x: Number(textBounds['-x']) + (textLength * 10 / 2),
				y: Number(textBounds["-y"]) + 5 // y轴偏移量
			}
		}
		// properties = { key: value, key1: value1 }
		// {key: value} => [[key, value]]
	
		Object.entries(processEdgeValue).forEach(([key, value]) => {
			if (!this.DEFAULT_ATTRS[key]) { // 如果 key 不存在 xml 属性默认属性中
				if (!properties) properties = {};
				properties[key] = value; // 
			}
		})
		if (properties) {
			// 转换为正常的 json
			properties = this.properties.toJson(properties);
		}

		return {
			id: processEdgeValue[this.DEFAULT_ELEMENT.process.id], // process 线条中 id
			type: this.BPMN_ELEMENTS.FLOW, // 类型为 bpmn 线条类型,
			pointsList: diEdgeValue[this.DEFAULT_ELEMENT.di.waypoint].map(point => {
				return {
					x: Number(point['-x']),
					y: Number(point['-y']),
				}
			}), // di 信息中的 点位
			sourceId: processEdgeValue[this.DEFAULT_ATTRS["-sourceRef"]],
			targetId: processEdgeValue[this.DEFAULT_ATTRS['-targetRef']],
			properties, // 自定义的bpmn 属性
			text: text || undefined, // 线条名称
		};
	}



}