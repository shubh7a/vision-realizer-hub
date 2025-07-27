import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Chart3DProps {
  data: any[];
  xAxis: string;
  yAxis: string;
}

function Column({ position, height, color, label }: { 
  position: [number, number, number]; 
  height: number; 
  color: string;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {label}
      </Text>
    </group>
  );
}

export const Chart3D = ({ data, xAxis, yAxis }: Chart3DProps) => {
  const processedData = useMemo(() => {
    const maxItems = 20; // Limit for performance
    const limitedData = data.slice(0, maxItems);
    
    const values = limitedData.map(item => parseFloat(item[yAxis]) || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return limitedData.map((item, index) => {
      const value = parseFloat(item[yAxis]) || 0;
      const normalizedHeight = ((value - minValue) / range) * 5 + 0.5; // Scale to 0.5-5.5
      
      const colors = [
        '#3B82F6', // blue
        '#F59E0B', // amber
        '#EF4444', // red
        '#10B981', // emerald
        '#8B5CF6', // violet
      ];
      
      return {
        position: [
          (index - limitedData.length / 2) * 1.2,
          0,
          0
        ] as [number, number, number],
        height: normalizedHeight,
        color: colors[index % colors.length],
        label: String(item[xAxis]).substring(0, 8),
        value: value,
      };
    });
  }, [data, xAxis, yAxis]);

  if (processedData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No valid data for 3D visualization
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [10, 8, 10], fov: 50 }}
      style={{ background: 'hsl(var(--background))' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {processedData.map((item, index) => (
        <Column
          key={index}
          position={item.position}
          height={item.height}
          color={item.color}
          label={item.label}
        />
      ))}
      
      {/* Axes */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[processedData.length * 1.2 + 2, 0.1, 0.1]} />
        <meshStandardMaterial color="hsl(var(--border))" />
      </mesh>
      
      <Text
        position={[0, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
      >
        {xAxis}
      </Text>
      
      <Text
        position={[-processedData.length * 0.6 - 2, 3, 0]}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
        fontSize={0.5}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
      >
        {yAxis}
      </Text>
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
};