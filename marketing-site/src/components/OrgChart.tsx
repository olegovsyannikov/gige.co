import { motion } from "framer-motion";
import { Card } from "./ui/card";
import {
  Brain,
  Palette,
  FileText,
  Eye,
  MessageCircle,
  Users,
  Globe,
  LifeBuoy,
  Target,
  TrendingUp,
  FileSearch,
  MessageSquare,
  Shield,
  Bot,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";

export type IconComponent = typeof Brain | typeof Palette | typeof FileText; // etc...

export interface TeamMember {
  title: string;
  description: string;
  icon: IconComponent;
}

export interface Department {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  team: TeamMember[];
}

export const departments: Department[] = [
  {
    id: 'content',
    title: 'Content Director',
    description: 'Manages content creation',
    icon: Palette,
    team: [
      {
        title: 'Content Writer',
        description: 'Creates engaging articles and posts',
        icon: FileText
      },
      {
        title: 'Visual Creator',
        description: 'Designs graphics and visuals',
        icon: Eye
      },
      {
        title: 'Script Writer',
        description: 'Creates video/audio scripts',
        icon: MessageCircle
      },
      {
        title: 'Video Editor',
        description: 'Edits and produces videos',
        icon: Eye
      },
      {
        title: 'Content Strategist',
        description: 'Plans content roadmap',
        icon: FileText
      },
      {
        title: 'Trend Analyzer',
        description: 'Identifies viral opportunities',
        icon: TrendingUp
      },
      {
        title: 'Content Optimizer',
        description: 'Enhances content performance',
        icon: Target
      }
    ]
  },
  {
    id: 'community',
    title: 'Community Director',
    description: 'Grows and engages audience',
    icon: Users,
    team: [
      {
        title: 'Community Manager',
        description: 'Manages community engagement',
        icon: MessageSquare
      },
      {
        title: 'Social Manager',
        description: 'Handles social presence',
        icon: Globe
      },
      {
        title: 'Support Agent',
        description: 'Assists community members',
        icon: LifeBuoy
      },
      {
        title: 'Engagement Specialist',
        description: 'Drives community interaction',
        icon: MessageCircle
      },
      {
        title: 'Event Coordinator',
        description: 'Organizes virtual events',
        icon: Users
      },
      {
        title: 'Feedback Analyzer',
        description: 'Processes community insights',
        icon: FileSearch
      },
      {
        title: 'Community Moderator',
        description: 'Maintains community standards',
        icon: Shield
      }
    ]
  },
  {
    id: 'growth',
    title: 'Growth Director',
    description: 'Scales reach and revenue',
    icon: Target,
    team: [
      {
        title: 'SEO Manager',
        description: 'Optimizes discoverability',
        icon: TrendingUp
      },
      {
        title: 'Ad Manager',
        description: 'Runs paid campaigns',
        icon: Target
      },
      {
        title: 'Distribution Manager',
        description: 'Expands content reach',
        icon: Globe
      },
      {
        title: 'Partnership Agent',
        description: 'Identifies collaboration opportunities',
        icon: Bot
      },
      {
        title: 'Conversion Optimizer',
        description: 'Improves audience conversion',
        icon: ArrowUpRight
      },
      {
        title: 'Growth Hacker',
        description: 'Finds viral growth opportunities',
        icon: Zap
      },
      {
        title: 'Audience Researcher',
        description: 'Analyzes target demographics',
        icon: Users
      }
    ]
  }
];

export default function OrgChart() {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [visibleStaff, setVisibleStaff] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      const allStaffIds = departments.flatMap(dept =>
        dept.team.map((_, index) => `${dept.id}-${index}`)
      );

      const nextStaffId = allStaffIds.find(id => !visibleStaff.has(id));

      if (nextStaffId) {
        setVisibleStaff(prev => new Set([...prev, nextStaffId]));
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [visibleStaff]);

  return (
    <div className="org-chart w-full max-w-7xl mx-auto py-16 px-4 relative">
      {/* CEO Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-16"
      >
        <Card className="department-card p-8 border-primary/20 w-full max-w-xl relative hover:bg-primary/5">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4 ring-4 ring-primary/20">
              <Brain className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-2">AI Creative Director</h3>
            <p className="text-muted-foreground">Orchestrates your creative vision</p>
          </div>
        </Card>
      </motion.div>

      {/* Directors Grid - Updated to 3 columns instead of 5 */}
      <div className="grid md:grid-cols-3 gap-8 relative">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative transition-opacity duration-300 ${activeDepartment && activeDepartment !== dept.id ? 'opacity-30' : 'opacity-100'
              }`}
            onMouseEnter={() => setActiveDepartment(dept.id)}
            onMouseLeave={() => setActiveDepartment(null)}
          >
            <Card
              className="department-card p-6 border-primary/20 hover:bg-primary/5 cursor-pointer"
              onClick={() => setActiveDepartment(dept.id)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <dept.icon className="w-10 h-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-2">{dept.title}</h4>
                <p className="text-sm text-muted-foreground">{dept.description}</p>
              </div>
            </Card>

            <div className="team-members mt-4 space-y-3">
              {dept.team.map((member, mIndex) => {
                const staffId = `${dept.id}-${mIndex}`;
                const isVisible = visibleStaff.has(staffId);

                return (
                  <motion.div
                    key={staffId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      x: isVisible ? 0 : -20,
                      height: isVisible ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`p-4 mb-2 bg-background/50 backdrop-blur-sm transition-all duration-300 ${activeDepartment === dept.id ? 'hover:bg-primary/10 scale-105' : 'hover:bg-primary/5'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors duration-300 ${activeDepartment === dept.id ? 'bg-primary/20' : 'bg-primary/10'
                          }`}>
                          <member.icon className={`w-5 h-5 transition-colors duration-300 ${activeDepartment === dept.id ? 'text-primary' : 'text-primary/70'
                            }`} />
                        </div>
                        <div>
                          <h5 className="font-medium">{member.title}</h5>
                          <p className="text-xs text-muted-foreground">{member.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}