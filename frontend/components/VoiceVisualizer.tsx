import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function VoiceVisualizer({
  isActive = true,
}: {
  isActive?: boolean;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setPhase((p) => (p + 0.05) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  const generatePath = (
    amplitude: number,
    frequency: number,
    offset: number
  ) => {
    const t = phase + offset;
    let path = "M 50 150";

    for (let x = 50; x <= 250; x += 5) {
      const normalizedX = (x - 50) / 200;
      const amp = amplitude + Math.sin(t) * (amplitude * 0.3);
      const y = 150 + Math.sin(normalizedX * frequency * Math.PI * 2 + t) * amp;
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  return (
    <View style={styles.container}>
      <Svg width='300' height='300' viewBox='0 0 300 300'>
        <Path
          d={generatePath(60, 3, 0)}
          stroke='#F5C563'
          strokeWidth='2'
          fill='none'
          opacity={0.6}
        />
        <Path
          d={generatePath(50, 2.5, Math.PI / 3)}
          stroke='#E8A93B'
          strokeWidth='2'
          fill='none'
          opacity={0.8}
        />
        <Path
          d={generatePath(70, 2, Math.PI / 2)}
          stroke='#D4922A'
          strokeWidth='2'
          fill='none'
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
});
