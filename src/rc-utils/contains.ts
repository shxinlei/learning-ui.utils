


/**
 * 检查节点 n 是否在节点 root 的子集中
 * @param root 
 * @param n 
 * @returns 
 */

const contains = (root: Node | null | undefined, target?: Node) =>  {

    if (!root) {
        return false;
    }

    return root.contains(target);
}
export default contains;