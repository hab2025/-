import { Tabs } from "expo-router";
import React from "react";
import { MessageSquare, Cpu, Settings } from "lucide-react-native";
import colors from "@/constants/colors";
import { useLanguage } from "@/hooks/language-store";

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("chat.newChat", "Chat"),
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: t("features.title", "Features"),
          tabBarIcon: ({ color }) => <Cpu color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title", "Settings"),
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

