// app/(tabs)/_layout.tsx - النسخة النهائية والمعدلة

import { useChatStore } from '@/hooks/chat-store';
import { useEffect } from 'react';
import { Tabs } from "expo-router";
import React from "react";
// --- 1. تعديل سطر الاستيراد ---
// لقد أضفنا أيقونة MonitorSmartphone هنا
import { MessageSquare, Cpu, Settings, MonitorSmartphone } from "lucide-react-native"; 
import colors from "@/constants/colors";
import { useLanguage } from "@/hooks/language-store";

export default function TabLayout() {
  const { t } = useLanguage();
  const { loadSessions } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        // هذه إعداداتك الحالية، سأحتفظ بها كما هي
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.card, // إضافة لون الخلفية ليتناسق
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerShown: false, // مهم: نخفي الهيدر الافتراضي
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
      
      {/* --- 2. إضافة التبويب الجديد هنا --- */}
      <Tabs.Screen
        name="computer" // اسم الملف: computer.tsx
        options={{
          title: "تحكم", // اسم التبويب
          tabBarIcon: ({ color }) => <MonitorSmartphone color={color} size={24} />,
        }}
      />
      {/* --- نهاية التبويب الجديد --- */}

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
