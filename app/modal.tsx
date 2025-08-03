import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/hooks/language-store";

export default function ModalScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('modal.title', 'Modal')}</Text>
      <View style={styles.separator} />
      <Text>{t('modal.message', 'This is an example modal. You can edit it in app/modal.tsx.')}</Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

