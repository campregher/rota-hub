import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { acceptJob, isAuthExpiredError, Job, updateJobStatus } from "../api/client";

type Props = {
  job: Job;
  onBack: () => void;
  onOpenPod: () => void;
  onLogout: () => void;
  onJobUpdated: (job: Job) => void;
};

const ACTION_LABEL_BY_STATUS: Record<string, string | undefined> = {
  OPEN: "Accept Job",
  ASSIGNED: "Mark PICKED_UP",
  PICKED_UP: "Mark IN_TRANSIT",
  IN_TRANSIT: "Mark DELIVERED"
};

export function JobDetailScreen({
  job,
  onBack,
  onOpenPod,
  onLogout,
  onJobUpdated
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const actionLabel = ACTION_LABEL_BY_STATUS[job.status];

  async function runPrimaryAction() {
    if (!actionLabel) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      let updated: Job;

      if (job.status === "OPEN") {
        updated = await acceptJob(job.id);
      } else if (job.status === "ASSIGNED") {
        updated = await updateJobStatus(job.id, "PICKED_UP");
      } else if (job.status === "PICKED_UP") {
        updated = await updateJobStatus(job.id, "IN_TRANSIT");
      } else if (job.status === "IN_TRANSIT") {
        updated = await updateJobStatus(job.id, "DELIVERED");
      } else {
        return;
      }

      onJobUpdated(updated);
    } catch (err) {
      if (isAuthExpiredError(err)) {
        onLogout();
        return;
      }
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Detail</Text>
      <Text style={styles.bodyText}>ID: {job.id}</Text>
      <Text style={styles.bodyText}>Status: {job.status}</Text>
      <Text style={styles.bodyText}>Notes: {job.notes || "-"}</Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
        <Pressable onPress={onOpenPod} style={styles.primaryButton}>
          <Text style={styles.primaryText}>POD Capture</Text>
        </Pressable>
      </View>

      {actionLabel ? (
        <Pressable
          onPress={runPrimaryAction}
          disabled={loading}
          style={styles.actionButton}
        >
          <Text style={styles.primaryText}>{loading ? "Running..." : actionLabel}</Text>
        </Pressable>
      ) : (
        <Text style={styles.bodyText}>No transition action available for this status.</Text>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  secondaryText: {
    color: "#334155"
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#14b8a6",
    borderRadius: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "flex-start"
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  errorText: {
    marginTop: 12,
    color: "#b91c1c"
  }
});
