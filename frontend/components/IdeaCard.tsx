import { Lightbulb, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Idea {
  title: string;
  content: string;
  category: string;
}

interface IdeaCardProps {
  searchQuery?: string;
}

export default function IdeaCard({ searchQuery = "" }: IdeaCardProps) {
  const [currentIdea, setCurrentIdea] = useState<Idea>({
    title: "",
    content: "",
    category: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Expanded brainstorm ideas with more categories and content
  const brainstormIdeas: Idea[] = [
    // Feature Ideas
    {
      title: "Loyalty Program",
      content:
        "What if we introduce a loyalty rewards program for premium users? These could be redeemed for exclusive perks and early access to features.",
      category: "Feature",
    },
    {
      title: "AI Assistant",
      content:
        "Integrate an AI assistant that can proactively suggest tasks based on user behavior and calendar events.",
      category: "Feature",
    },
    {
      title: "Voice Integration",
      content:
        "Implement voice commands for hands-free task management and note-taking while on the go.",
      category: "Feature",
    },
    {
      title: "Smart Templates",
      content:
        "Create intelligent templates that adapt based on user preferences and past project success patterns.",
      category: "Feature",
    },
    {
      title: "Cross-Platform Sync",
      content:
        "Develop seamless synchronization across all devices with real-time updates and conflict resolution.",
      category: "Feature",
    },

    // User Experience
    {
      title: "Gamification",
      content:
        "Add gamification elements like achievement badges and level progression to increase user engagement and retention.",
      category: "UX",
    },
    {
      title: "Focus Mode",
      content:
        "Implement a focus mode that blocks distractions and uses Pomodoro technique for better concentration.",
      category: "UX",
    },
    {
      title: "Smart Scheduling",
      content:
        "Implement AI-powered scheduling that automatically finds optimal times for tasks based on energy levels.",
      category: "UX",
    },
    {
      title: "Dark Mode Variants",
      content:
        "Create multiple dark mode themes with different color schemes for personal preference and accessibility.",
      category: "UX",
    },
    {
      title: "Gesture Controls",
      content:
        "Add intuitive gesture controls for quick actions like archiving, prioritizing, and categorizing tasks.",
      category: "UX",
    },

    // Technical
    {
      title: "Offline Mode",
      content:
        "Develop a robust offline mode that syncs automatically when connection is restored.",
      category: "Technical",
    },
    {
      title: "Custom Widgets",
      content:
        "Allow users to create and customize their own widgets for specific needs and workflows.",
      category: "Technical",
    },
    {
      title: "API Integration",
      content:
        "Build a comprehensive API that allows developers to create plugins and extensions.",
      category: "Technical",
    },
    {
      title: "Data Export",
      content:
        "Implement advanced data export options with multiple formats and customizable fields.",
      category: "Technical",
    },
    {
      title: "Backup Systems",
      content:
        "Create automated backup systems with version history and easy restoration options.",
      category: "Technical",
    },

    // Business
    {
      title: "Template Marketplace",
      content:
        "Create a marketplace where users can buy and sell productivity templates and workflows.",
      category: "Business",
    },
    {
      title: "Team Collaboration",
      content:
        "Add enterprise features for team collaboration with admin controls and analytics.",
      category: "Business",
    },
    {
      title: "White Label Solution",
      content:
        "Develop a white label version for businesses to customize with their branding.",
      category: "Business",
    },
    {
      title: "Affiliate Program",
      content:
        "Launch an affiliate program to incentivize users to refer new customers.",
      category: "Business",
    },
    {
      title: "Premium Workshops",
      content:
        "Offer premium workshops and webinars on productivity techniques and advanced features.",
      category: "Business",
    },

    // Wellness
    {
      title: "Wellness Integration",
      content:
        "Combine productivity with wellness by suggesting breaks and mindfulness exercises based on work patterns.",
      category: "Wellness",
    },
    {
      title: "Burnout Prevention",
      content:
        "Implement features that detect potential burnout and suggest healthier work habits.",
      category: "Wellness",
    },
    {
      title: "Sleep Optimization",
      content:
        "Integrate with sleep tracking to suggest optimal work times based on sleep quality and patterns.",
      category: "Wellness",
    },
    {
      title: "Energy Management",
      content:
        "Track user energy levels throughout the day and schedule demanding tasks during peak energy times.",
      category: "Wellness",
    },
    {
      title: "Mindful Notifications",
      content:
        "Design notifications that promote mindfulness and intentional breaks rather than constant interruptions.",
      category: "Wellness",
    },

    // Innovation
    {
      title: "AR Workspace",
      content:
        "Create an augmented reality workspace that projects tasks and notes into physical space.",
      category: "Innovation",
    },
    {
      title: "Blockchain Verification",
      content:
        "Use blockchain to create verifiable proof of completed tasks and achievements.",
      category: "Innovation",
    },
    {
      title: "Predictive Analytics",
      content:
        "Implement machine learning to predict task completion times and suggest deadline adjustments.",
      category: "Innovation",
    },
    {
      title: "Voice Journaling",
      content:
        "Add voice-to-text journaling for quick idea capture and reflection sessions.",
      category: "Innovation",
    },
    {
      title: "Smart Home Integration",
      content:
        "Connect with smart home devices to create optimal work environments automatically.",
      category: "Innovation",
    },

    // Social
    {
      title: "Productivity Communities",
      content:
        "Build communities where users can share goals, challenges, and celebrate achievements together.",
      category: "Social",
    },
    {
      title: "Accountability Partners",
      content:
        "Create a system for matching accountability partners with similar goals and schedules.",
      category: "Social",
    },
    {
      title: "Skill Sharing",
      content:
        "Allow users to share productivity techniques and learn from each other's workflows.",
      category: "Social",
    },
    {
      title: "Group Challenges",
      content:
        "Organize group productivity challenges with leaderboards and collective rewards.",
      category: "Social",
    },
    {
      title: "Expert Sessions",
      content:
        "Host live sessions with productivity experts for Q&A and coaching.",
      category: "Social",
    },
  ];

  // Filter ideas based on search query
  const filteredIdeas = searchQuery
    ? brainstormIdeas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : brainstormIdeas;

  const generateRandomIdea = () => {
    setIsRefreshing(true);

    if (filteredIdeas.length === 0) {
      setCurrentIdea({
        title: "No matching ideas",
        content: "Try a different search term",
        category: "No Results",
      });
      setIsRefreshing(false);
      return;
    }

    // Filter out current idea to avoid immediate repeats
    const availableIdeas = filteredIdeas.filter(
      (idea) => idea.title !== currentIdea.title
    );
    const randomIndex = Math.floor(Math.random() * availableIdeas.length);
    setCurrentIdea(availableIdeas[randomIndex]);

    // Reset refreshing state after a short delay for animation
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    generateRandomIdea();
  }, [searchQuery]); // Regenerate when search query changes

  const handleRefresh = () => {
    generateRandomIdea();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Feature: "#FF6B6B",
      UX: "#4ECDC4",
      Technical: "#45B7D1",
      Business: "#96CEB4",
      Wellness: "#FFEAA7",
      Innovation: "#DDA0DD",
      Social: "#FFA07A",
      "No Results": "#8B7965",
    };
    return colors[category] || "#FFFFFF";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Lightbulb size={20} color='#FFFFFF' strokeWidth={2} />
          <Text style={styles.title}>Brainstorm Idea</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, isRefreshing && styles.refreshing]}
          onPress={handleRefresh}
        >
          <RefreshCw size={20} color='#FFFFFF' strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {currentIdea.category && (
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(currentIdea.category) },
            ]}
          >
            <Text style={styles.categoryText}>{currentIdea.category}</Text>
          </View>
        )}
        <Text style={styles.ideaTitle}>{currentIdea.title}</Text>
        <Text style={styles.description}>{currentIdea.content}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {searchQuery
            ? `Searching: "${searchQuery}" • ${filteredIdeas.length} matching ideas`
            : `Tap refresh for new ideas • ${brainstormIdeas.length} total ideas`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5C563",
    borderRadius: 24,
    padding: 20,
    width: 200,
    minHeight: 220,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshing: {
    transform: [{ rotate: "180deg" }],
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1A1410",
  },
  ideaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontStyle: "italic",
  },
});
