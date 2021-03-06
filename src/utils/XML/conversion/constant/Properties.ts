




export const BPMN_ELEMENTS = {
	START: 'bpmn:startEvent', // 开始节点
	END: 'bpmn:endEvent', // 结束节点
	GATEWAY: 'bpmn:exclusiveGateway', // gateway 网关
	USER: 'bpmn:userTask', // 用户节点
	SYSTEM: 'bpmn:serviceTask', // serviceTask 节点
	FLOW: 'bpmn:sequenceFlow', // 线
}

export default class Properties {

	// 转换为正常的 json
	public toJson(properties: { [key: string]: any }) {
		const json: { [key: string]: any } = {};
        let inset = [  "-" , "#" , "documentation" ];
		Object.entries(properties).forEach(([key, value]) => {
			if (typeof value !== 'object') {
				if (inset.find(i => key.includes(i))) { // 如果本来就是“-”开头的了，那就不处理了。
					json[key] = value;
				} else {
                    json[`-${key}`] = value;
				}
			} else {
				json[key] = this.toJson(value);
			}
		});
		return json;
	}
}