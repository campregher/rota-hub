import { Pressable, StyleSheet, Text, View } from "react-native";
import { Job } from "../api/client";

type Props = {
  job: Job;
  onBack: () => void;
  onOpenPod: () => void;
};

export function JobDetailScreen({ job, onBack, onOpenPod }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Detail</Text>
      <Text style={styles.bodyText}>ID: {job.id}</Text>
      <Text style={styles.bodyText}>Status: {job.status}</Text>
      <Text style={styles.bodyText}>Notes: {job.notes || "-"}</Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.bodyText}>Back</Text>
        </Pressable>
        <Pressable onPress={onOpenPod} style={styles.primaryButton}>
          <Text style={{ color: "white" }}>POD Capture</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc"
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0f172a"
  },
  bodyText: {
    color: "#334155"
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginRight: 12
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#14b8a6",
    borderRadius: 8
  }
});
