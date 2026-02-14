import { useState } from 'react';
import { Button, Image, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type Screen = 'login' | 'feed' | 'detail' | 'pod';

type Job = {
  id: string;
  status: string;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const loadFeed = async () => {
    const response = await fetch(`${API_URL}/courier/feed`);
    const data = await response.json();
    setJobs(data);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri || null);
    }
  };

  const login = () => {
    setScreen('feed');
    void loadFeed();
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <ScrollView contentContainerStyle={{ gap: 16 }}>
        {screen === 'login' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '600' }}>Courier Login</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Entrar" onPress={login} />
          </View>
        )}

        {screen === 'feed' && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '600' }}>Feed de Jobs</Text>
            <Button title="Atualizar" onPress={loadFeed} />
            {jobs.map((job) => (
              <Button
                key={job.id}
                title={`Job ${job.id} - ${job.status}`}
                onPress={() => {
                  setSelectedJob(job);
                  setScreen('detail');
                }}
              />
            ))}
          </View>
        )}

        {screen === 'detail' && selectedJob && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '600' }}>Job Detail</Text>
            <Text>ID: {selectedJob.id}</Text>
            <Text>Status: {selectedJob.status}</Text>
            <Button title="Registrar POD" onPress={() => setScreen('pod')} />
            <Button title="Voltar" onPress={() => setScreen('feed')} />
          </View>
        )}

        {screen === 'pod' && selectedJob && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '600' }}>POD Capture</Text>
            <Button title="Selecionar Foto" onPress={pickImage} />
            {photoUri && <Image source={{ uri: photoUri }} style={{ width: 200, height: 200 }} />}
            <Button title="Enviar POD (TODO)" onPress={() => setScreen('detail')} />
            <Button title="Voltar" onPress={() => setScreen('detail')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
