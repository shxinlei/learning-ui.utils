


/**
 * 检查节点 n 是否在节点 root 的子集中
 * @param root
 * @param target
 * @returns
 */

const contains = (root: Node | null | undefined, target?: Node) =>  {

    if (!root) {
        return false;
    }

    if(target){
        return root.contains(target);
    }
    return false;
}
export default contains;