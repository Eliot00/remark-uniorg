import type { Nodes, PhrasingContent } from 'mdast'
import { visit, CONTINUE } from 'unist-util-visit'
import type { Transformer } from 'unified'
import type { OrgNode, ObjectType } from 'uniorg'

export default function remarkToUniorg() {
    return transformer
}

const transformer: Transformer = (tree) => {
    const orgNodes: OrgNode[] = []
    visit(tree, (node) => {
        const orgNode = convertMdNodeToOrgNode(node as Nodes)
        orgNodes.push(orgNode)
        return CONTINUE
    })

    return {
        type: 'org-data',
        contentsBegin: 0,
        contentsEnd: 0,
        children: orgNodes,
    }
}

function convertMdNodeToOrgNode(mdNode: Nodes): OrgNode {
    switch (mdNode.type) {
        case 'break':
        case 'delete':
        case 'emphasis':
        case 'footnoteReference':
        case 'html':
        case 'image':
        case 'imageReference':
        case 'inlineCode':
        case 'link':
        case 'linkReference':
        case 'strong':
        case 'text': {
            return convertPhrasingContentToObjectType(mdNode)
        }
        case 'blockquote': {
            return {
                type: 'quote-block',
                contentsBegin: 0,
                contentsEnd: 0,
                affiliated: {},
                children: [],
            }
        }
        case 'code': {
            return {
                type: 'src-block',
                affiliated: {},
                language: mdNode.lang ?? '',
                value: mdNode.value,
            }
        }
        case 'heading': {
            return {
                type: 'headline',
                level: mdNode.depth,
                todoKeyword: null,
                priority: null,
                commented: false,
                rawValue: '',
                tags: [],
                children: mdNode.children.map(convertPhrasingContentToObjectType),
            }
        }
        case 'paragraph': {
            return {
                type: 'paragraph',
                contentsBegin: 0,
                contentsEnd: 0,
                children: mdNode.children.map(convertPhrasingContentToObjectType),
            }
        }
        default: {
            throw new Error(`Unsupported node type: ${mdNode.type}`)
        }
    }
}

function convertPhrasingContentToObjectType(node: PhrasingContent): ObjectType {
    switch (node.type) {
        case 'text': {
            return {
                type: 'text',
                value: node.value,
            }
        }
        case 'strong': {
            return {
                type: 'bold',
                children: node.children.map(convertPhrasingContentToObjectType),
            }
        }
        case 'emphasis': {
            return {
                type: 'italic',
                children: node.children.map(convertPhrasingContentToObjectType),
            }
        }
        case 'delete': {
            return {
                type: 'strike-through',
                children: node.children.map(convertPhrasingContentToObjectType),
            }
        }
        case 'inlineCode': {
            return {
                type: 'code',
                value: node.value,
            }
        }
        case 'link': {
            return {
                type: 'link',
                format: 'bracket',
                linkType: 'https',
                path: '',
                rawLink: node.url,
                children: node.children.map(convertPhrasingContentToObjectType),
            }
        }
        default: {
            throw new Error(`Unsupported node type: ${node.type}`)
        }
    }
}
