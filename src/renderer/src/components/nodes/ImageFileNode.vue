<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import { Position, Handle } from '@vue-flow/core'
import { formatDistanceToNow } from 'date-fns'
import { formatBytes } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import { getFileIcon } from '@/lib/fileIcon'
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ImageFileNodeData } from './ImageFileNode'

defineProps<NodeProps<ImageFileNodeData>>()

const description = ref('')
</script>

<template>
  <div
    class="group relative bg-background rounded-xl border border-border shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 p-5 min-w-[250px]"
  >
    <div class="flex flex-col gap-4">
      <!-- 图片预览 -->
      <div class="w-full max-w-[200px] max-h-[200px] rounded-lg overflow-hidden bg-muted mx-auto">
        <img :src="data.url" :alt="data.name" class="w-full h-full object-contain" />
      </div>

      <div class="flex items-start gap-5">
        <div class="relative">
          <div class="absolute inset-0 bg-primary/10 blur-lg rounded-full"></div>
          <Icon
            :icon="getFileIcon(data.type)"
            class="text-3xl text-primary relative z-10 transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div class="space-y-2">
          <h4 class="text-sm font-medium leading-none group-hover:text-primary transition-colors">
            {{ data.name }}
          </h4>

          <div class="flex items-center text-xs text-muted-foreground/75">
            <span class="font-medium">{{ formatBytes(data.size) }}</span>
            <span class="mx-2 opacity-50">•</span>
            <span class="italic">{{
              formatDistanceToNow(data.updatedAt, { addSuffix: true })
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <Separator class="my-4" />
    <Input v-model="description" class="text-xs" placeholder="Tips" />
  </div>
</template>

<style scoped>
.group:hover .handle {
  @apply bg-primary;
  transform: scale(1.2);
  transition: all 0.3s ease;
}

.handle {
  transition: all 0.3s ease;
}
</style>
