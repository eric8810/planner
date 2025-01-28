<script setup lang="ts">
import { ref } from 'vue'
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
import NavigationMenu from './NavigationMenu.vue'
import ProjectsMenu from './ProjectsMenu.vue'
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
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}

const activeTeam = ref(data.teams[0])
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
        <NavigationMenu :nav-items="data.navMain" />
        <ProjectsMenu :projects="data.projects" />
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
