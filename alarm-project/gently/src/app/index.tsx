import { Text, View } from 'react-native';

// Temporary screen for step 1: shows that Tailwind and both fonts work.
// It gets replaced by the real screens in the next steps.
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-[#0A0605] px-6">
      <Text className="font-mono text-[10px] uppercase tracking-[2.4px] text-white/80">
        Getting up in
      </Text>
      <Text className="font-sans-bold text-4xl text-[#F4EEE6]">Gently</Text>
      <Text className="font-mono text-xs text-white/70">Soft Rain · 7:30 – 8:00</Text>
    </View>
  );
}
