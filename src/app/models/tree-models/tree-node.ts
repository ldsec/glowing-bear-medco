import { TreeNode as PrimeNgTreeNode } from 'primeng/api';
import { DropMode } from '../drop-mode';
import { ConceptType } from '../constraint-models/concept-type';
import { TreeNodeType } from './tree-node-type';
import { MedcoEncryptionDescriptor } from './medco-encryption-descriptor';

export class TreeNode implements PrimeNgTreeNode {

  // --- fields for GB logic
  path: string;
  name: string;
  displayName: string;
  description: string;

  // idiosyncratic to I2B2
  appliedPath: string;
  appliedConcept: TreeNode;

  // type of node (concept, study, ...)
  nodeType: TreeNodeType;
  // type of concept if node is a concept
  conceptType: ConceptType;
  conceptCode: string;
  dropMode: DropMode;
  metadata: object;
  // depth of the node in the tree
  depth: number;
  // number of subject (possibly undefined) associated with this node
  subjectCount: number;


  // flag to signal if the children were requested to the backend
  childrenAttached: boolean;

  encryptionDescriptor: MedcoEncryptionDescriptor;

  // --- fields for PrimeNg TreeNode logic
  children: TreeNode[];
  icon: string;
  label: string;
  expandedIcon: string;
  collapsedIcon: string;
  leaf: boolean;
  expanded: boolean;
  styleClass: string;
  parent: TreeNode;
  partialSelected: boolean;

  clone(): TreeNode {
    let copy: TreeNode = new TreeNode();
    copy.path = this.path;
    copy.appliedPath = this.appliedPath;
    copy.name = this.name;
    copy.displayName = this.displayName;
    copy.description = this.description;
    copy.nodeType = this.nodeType;
    copy.conceptType = this.conceptType;
    copy.conceptCode = this.conceptCode;
    copy.dropMode = this.dropMode;
    if (this.metadata) {
      copy.metadata = JSON.parse(JSON.stringify(this.metadata));
    }
    copy.depth = this.depth;
    copy.subjectCount = this.subjectCount;
    copy.childrenAttached = this.childrenAttached;
    // copy.children = this.children.map((child) => child.clone());
    copy.icon = this.icon;
    copy.label = this.label;
    copy.expandedIcon = this.expandedIcon;
    copy.collapsedIcon = this.collapsedIcon;
    copy.leaf = this.leaf;
    copy.expanded = this.expanded;
    copy.styleClass = this.styleClass;
    // copy.parent =
    copy.partialSelected = this.partialSelected;
    return copy
  }

  /**
   * Returns true if children were attached and at least 1 is present.
   * @returns {boolean}
   */
  hasChildren(): boolean {
    return this.childrenAttached && this.children.length > 0;
  }

  /**
   * Returns true if 'this' is a parent of 'node'.
   *
   * @param {TreeNode} node
   * @returns {boolean}
   */
  isParentOf(node: TreeNode): boolean {
    return node.path.startsWith(this.path) &&
      node.path.length > this.path.length;
  }


  /**
   * Returns true if 'this' is a parent if it is a modifier, modifier container or modifier folder.
   *
   * @returns {boolean}
   */
  isModifier() {
    return ((this.nodeType === TreeNodeType.MODIFIER)
      || (this.nodeType === TreeNodeType.MODIFIER_CONTAINER)
      || (this.nodeType === TreeNodeType.MODIFIER_FOLDER))
  }

  /**
   * Generate the tree structure based on the path of the children treeNodes and attach it to the current node.
   * Note: this will consume the treeNodes array.
   *
   * @param {TreeNode[]} treeNodes
   */
  attachChildTree(treeNodes: TreeNode[]) {

    for (let i = 0; i < treeNodes.length; i++) {
      if (treeNodes[i] === undefined) {
        continue;
      }
      this.children.push(treeNodes[i])
    }

    this.childrenAttached = true;
  }


  /**
   * Set the applied concept to modifiers in the children, if any.
   *
   * @param {TreeNode[]} treeNodes
   *
   */
  attachModifierData(treeNodes: TreeNode[]) {
    for (let i = 0; i < treeNodes.length; i++) {
      if (treeNodes[i] === undefined || !(treeNodes[i].isModifier())) {
        continue;
      }
      if (this.isModifier()) {
        treeNodes[i].appliedConcept = this.appliedConcept
      } else {
        treeNodes[i].appliedConcept = this
      }
    }
  }
}
