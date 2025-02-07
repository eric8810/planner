<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge, NodeMouseEvent } from '@vue-flow/core'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
import SpecialNode from './nodes/SpecialNode.vue'
import SpecialEdge from './nodes/SpecialEdge.vue'
import DocumentFileNode from './nodes/DocumentFileNode.vue'
import { DocumentFileNodeData } from './nodes/DocumentFileNode'
import ImageFileNode from './nodes/ImageFileNode.vue'
import { ImageFileNodeData } from './nodes/ImageFileNode'
import { getFileType } from '@/lib/utils'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'

// import default controls styles
import '@vue-flow/controls/dist/style.css'
// import default minimap styles
import '@vue-flow/minimap/dist/style.css'

// these are our nodes
const nodes = ref<Node[]>([])

// these are our edges
const edges = ref<Edge[]>([])

const { addNodes, setNodes } = useVueFlow()

const onDrop = async (event: DragEvent) => {
  event.preventDefault()

  const bounds = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
  const position = {
    x: event.clientX - (bounds?.left ?? 0),
    y: event.clientY - (bounds?.top ?? 0)
  }

  // Handle dropped files
  if (event.dataTransfer?.files.length) {
    const files = Array.from(event.dataTransfer.files) as File[]
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const newNode: Node<ImageFileNodeData> = {
          id: `${Date.now()}-${nodes.value.length}`,
          position,
          type: 'image-file',
          data: {
            id: `file-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type,
            updatedAt: new Date(file.lastModified),
            url: URL.createObjectURL(file)
          }
        }
        addNodes(newNode)
      } else {
        const newNode: Node<DocumentFileNodeData> = {
          id: `${Date.now()}-${nodes.value.length}`,
          position,
          type: 'document-file',
          data: {
            id: `file-${file.name}`,
            name: file.name,
            type: file.type ? getFileType(file.name) : 'folder',
            path: (file as any).path,
            size: file.size,
            createdAt: new Date(file.lastModified),
            updatedAt: new Date(file.lastModified),
            description: file.name
          }
        }
        addNodes(newNode)
      }

      // Offset next node position slightly if multiple files
      position.x += 20
      position.y += 20
    }
    return
  }

  // Handle dropped text/urls
  const text = event.dataTransfer?.getData('text')
  if (text) {
    const isUrl = text.startsWith('http://') || text.startsWith('https://')
    const newNode: Node = {
      id: `${Date.now()}-${nodes.value.length}`,
      position,
      data: {
        label: isUrl ? new URL(text).hostname : text,
        type: isUrl ? 'url' : 'text',
        content: text
      }
    }
    addNodes(newNode)
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const onNodeClick = (event: NodeMouseEvent) => {
  console.log(event)
  const { node } = event
}
</script>

<template>
  <div class="w-full h-full" @drop="onDrop" @dragover="onDragOver">
    <VueFlow class="bg-muted rounded-lg" :nodes="nodes" :edges="edges" @node-click="onNodeClick">
      <Background :pattern-color="'#3e3e3e'" />

      <!-- 图片节点 -->
      <template #node-image-file="imageFileNodeProps">
        <ImageFileNode v-bind="imageFileNodeProps" />
      </template>

      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-special="specialNodeProps">
        <SpecialNode v-bind="specialNodeProps" />
      </template>

      <template #node-document-file="documentFileNodeProps">
        <DocumentFileNode v-bind="documentFileNodeProps" />
      </template>

      <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
      <template #edge-special="specialEdgeProps">
        <SpecialEdge v-bind="specialEdgeProps" />
      </template>
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>
