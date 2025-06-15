import { Icon } from "@iconify/vue";
import {TabsList, TabsContent, TabsTrigger} from "@ui/components/tabs";
import { useScroll } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { cn } from "@lib/utils";
import { Button } from "@ui/components/button";

export const technologies = [
  {
    title: 'Java Spring Boot',
    icon: 'simple-icons:openjdk',
  },
  {
    title: 'Node.js',
    icon: 'simple-icons:nodedotjs',
  },
  {
    title: 'TypeScript',
    icon: 'simple-icons:typescript',
  },
  {
    title: 'Vue.js',
    icon: 'simple-icons:vuedotjs',
  },
  {
    title: 'MongoDB',
    icon: 'simple-icons:mongodb',
  },
  {
    title: 'PostgreSQL',
    icon: 'simple-icons:postgresql',
  },
  {
    title: 'MySQL',
    icon: 'simple-icons:mysql',
  },
  {
    title: 'Docker',
    icon: 'simple-icons:docker',
  },
  {
    title: 'Proxmox',
    icon: 'simple-icons:proxmox'
  }
];
export const socials = [
  {
    name: 'GitHub',
    url: 'https://github.com/UaltarH',
    icon: 'radix-icons:github-logo',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/gauthier-lo/',
    icon: 'radix-icons:linkedin-logo',
  }
];
export default defineComponent({
  name: 'HobbyList',
  setup() {
    const el = useTemplateRef<HTMLElement>('el')
    const { x, y, isScrolling, arrivedState, directions } = useScroll(el)
    const hobbies = [
      {
        title: 'Piano',
        icon: 'game-icons:piano-keys',
        description: (
          <>I've been playing since a very young age and I enjoy playing classical music, and OST music.<br/>
            Playing the piano is a great way to relax and unwind after a long day.
          </>
        ),
      },
      {
        title: 'Board Games',
        icon: 'game-icons:domino-tiles',
        description: 'Playing board games is a great way to spend quality time with friends and family. I enjoy strategy games, cooperative games, and detective games. It\'s a fun way to challenge my mind and have fun with others.',
      },
      {
        title: 'Theater',
        icon: 'game-icons:drama-masks',
        description: 'Between 2021 and 2023, in other to improve my eloquence and my confidence, I attended a theater class. It was a great experience that helped me to become more confident in front of an audience, and to express myself better.',
      },
      {
        title: 'Badminton',
        icon: 'game-icons:shuttlecock',
        description: 'Badminton is my favorite sport. I can be very competitive, but I also enjoy playing it with my friends and family for fun.',
      },
      {
        title: 'Handcrafting',
        icon: 'game-icons:anvil',
        description: 'I love creating and building things with my hands (stained glass, ceramic, leather ..). In my free time, I enjoy fixing and maintaining my leather goods. Coding is to me a form of crafting.',
      },
      {
        title: 'Hiking',
        icon: 'game-icons:fuji',
        description: 'Hiking is very relaxing and a great way to clear my mind. I always enjoy the scenery and the fresh air. It\'s a great way to disconnect from the digital world.',
      }
    ];
    function onScroll(value) {
      console.log('Scrolled to:', value);
    }
    function scroll(direction: 'right' | 'left') {
      console.log('Scroll direction:', direction);
      if (!el.value) return;
      const scrollMin: number = 0;
      const scrollMax: number = el.value.clientWidth;
      const scrollStep: number = 200;
      let scrollAmount = 0;
      if (direction === 'left') {
        el.value.scrollBy({ top: 0,  left: -scrollStep, behavior: 'smooth' });
      } else if (direction === 'right') {
        el.value.scrollBy({ top: 0, left: +scrollStep, behavior: 'smooth' });
      }
    }
    return () => (
      <>
        <div class="relative overflow-hidden rounded-md">
          <Button variant="ghost"
                  class={cn("absolute left-0 top-1/2 -translate-y-1/2 z-10 hover:bg-transparent hover:scale-125 transition duration-300 ease-in-out" +
                    (arrivedState.left ? ' hidden': ''))}
                  onClick={() => scroll('left')}
          >
            <Icon icon="ic:round-arrow-back-ios" class="text-2xl" />
          </Button>
          <Button variant="ghost"
                  class={cn("absolute right-0 top-1/2 -translate-y-1/2 z-10 hover:bg-transparent hover:scale-125 transition duration-300 ease-in-out scroll-smooth" +
                    (arrivedState.right ? ' hidden': ''))}
                  onClick={() => scroll('right')}
          >
            <Icon icon="ic:round-arrow-forward-ios" class="text-2xl" />
          </Button>
          <div ref="el" class="overflow-scroll scroll-w-none" v-scroll={onScroll} >
            <TabsList class="flex flew-wrap justify-start items-center gap-4 bg-background/40 border-none text-foreground p-2 w-max">
              {
                hobbies.map(hobby => (
                  <TabsTrigger
                    key={hobby.title}
                    value={hobby.title}
                    class="w-32 h-16 p-2 border-border bg-transparent data-[state=active]:bg-background/60 whitespace-normal flex-col gap-2 hover:bg-background/20"
                    aria-label={'Hobby: ' + hobby.title}
                  >
                    <Icon icon={hobby.icon} class="inline-block text-2xl" />
                    <span>{hobby.title}</span>
                  </TabsTrigger>
                ))
              }
            </TabsList>
          </div>
        </div>
        {
          hobbies.map(hobby => (
            <TabsContent
              key={hobby.title}
              value={hobby.title}
              class="bg-background/40 px-4 py-8 rounded-md animate-fade-left"
            >
              <h3 class="text-xl mb-4 font-semibold">{hobby.title}</h3>
              <p class="text-lg mb-2">
                {hobby.description}
              </p>
            </TabsContent>
          ))
        }
      </>
    )
  }
})
