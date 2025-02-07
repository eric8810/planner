<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction
} from '@/components/ui/sidebar'
import { Board } from '@shared/interfaces'
import { Folder, Forward, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
  (e: 'selectBoard', boardId: string): void
  (e: 'createBoard'): void
}>()

defineProps<{
  boards: Board[]
  selectedBoard: Board | null
}>()

const onSelectBoard = (boardId: string) => {
  emit('selectBoard', boardId)
}

const onCreateBoard = () => {
  emit('createBoard')
}
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Projects</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton variant="outline" @click="onCreateBoard">
          <Icon icon="lucide:plus" />
          <span>创建面板</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem v-for="item in boards" :key="item.name">
        <SidebarMenuButton
          :class="['cursor-pointer', selectedBoard?.id === item.id ? ' bg-accent' : '']"
          as-child
        >
          <a @click="onSelectBoard(item.id)">
            <Icon icon="lucide:git-branch" />
            <span>{{ item.name }}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48 rounded-lg" side="bottom" align="end">
            <DropdownMenuItem>
              <Folder class="text-muted-foreground" />
              <span>View Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>Share Project</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
