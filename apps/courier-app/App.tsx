import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Job } from "./src/api/client";
import { FeedScreen } from "./src/screens/FeedScreen";
import { JobDetailScreen } from "./src/screens/JobDetailScreen";
import { PODCaptureScreen } from "./src/screens/PODCaptureScreen";

type Screen = "feed" | "jobDetail" | "podCapture";

export default function App() {
  const [screen, setScreen] = useState<Screen>("feed");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <SafeAreaView style={styles.root}>
      {screen === "feed" ? (
        <FeedScreen
          onSelectJob={(job) => {
            setSelectedJob(job);
            setScreen("jobDetail");
          }}
        />
      ) : null}

      {screen === "jobDetail" && selectedJob ? (
        <JobDetailScreen
          job={selectedJob}
          onBack={() => setScreen("feed")}
          onOpenPod={() => setScreen("podCapture")}
        />
      ) : null}

      {screen === "podCapture" && selectedJob ? (
        <PODCaptureScreen jobId={selectedJob.id} onBack={() => setScreen("jobDetail")} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc"
  }
});
