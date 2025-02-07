<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  Sidebar
} from '@/components/ui/sidebar'
import TeamSelector from './TeamSelector.vue'
import BoardsMenu from './BoardsMenu.vue'
import UserProfile from './UserProfile.vue'
import Header from './Header.vue'
import MainContent from './MainContent.vue'
import {
  AudioWaveform,
  Bot,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from 'lucide-vue-next'
import { useUserBoard } from '@/composables/userBoard'

const props = defineProps<{
  userId: string
}>()

const {
  boards,
  selectedBoard,
  getBoards,
  selectBoard,
  createBoard,
  createNode,
  updateNode,
  deleteNode,
  createRelation
} = useUserBoard(props.userId)

const onCreateBoard = async () => {
  await createBoard()
}
const onSelectBoard = (boardId: string) => {
  if (selectedBoard.value?.id !== boardId) {
    selectBoard(boardId)
  }
}

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ]
}

const activeTeam = ref(data.teams[0])

onMounted(() => {
  getBoards()
})
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" class="bg-sidebar">
      <SidebarHeader>
        <TeamSelector
          :active-team="activeTeam"
          :teams="data.teams"
          @update:active-team="(team) => (activeTeam = team)"
        />
      </SidebarHeader>
      <SidebarContent>
        <BoardsMenu
          :boards="boards"
          :selected-board="selectedBoard"
          @select-board="onSelectBoard"
          @create-board="onCreateBoard"
        />
        <!-- <NavigationMenu :nav-items="data.navMain" /> -->
      </SidebarContent>
      <SidebarFooter>
        <UserProfile :user="data.user" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <Header />
      <MainContent />
    </SidebarInset>
  </SidebarProvider>
</template>
