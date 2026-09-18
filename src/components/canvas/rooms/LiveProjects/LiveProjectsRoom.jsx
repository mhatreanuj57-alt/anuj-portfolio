import { useEffect, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';

const PROJECT_URL = 'https://navi-mumbai-house-price-prediction-26wdhvjsm.vercel.app';

const LiveProjectsRoom = ({ showRoom, onReady }) => {
    const [hovered, setHovered] = useState(false);
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);

    return (
        <group position={[0, 0.5, -8.4]}>
            <RoundedBox args={[8.9, 5.45, 0.14]} radius={0.2} smoothness={5} position={[0.14, -0.12, -0.08]}><meshBasicMaterial color="#b6a894" /></RoundedBox>
            <RoundedBox args={[8.9, 5.45, 0.16]} radius={0.2} smoothness={5}><meshBasicMaterial color="#fffdf8" /></RoundedBox>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.53} color="#171411" anchorX="left" position={[-3.9, 1.98, .13]}>HOUSE PRICE PREDICTION</Text>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.19} color="#695e52" anchorX="left" position={[-3.9, 1.46, .13]}>NAVI MUMBAI + BMC PROPERTY INTELLIGENCE</Text>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.26} color="#1d1a16" anchorX="left" anchorY="top" maxWidth={4.45} lineHeight={1.4} position={[-3.9, .72, .13]}>Predict property values using locality, BHK, area and market data. Explore diagnostic charts and comparable listings in the live app.</Text>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.2} color="#277452" anchorX="left" position={[-3.9, -1.62, .13]}>PYTHON   •   MACHINE LEARNING   •   VERCEL</Text>
            <group position={[2.25, -.18, .14]} onClick={() => window.open(PROJECT_URL, '_blank', 'noopener,noreferrer')} onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}>
                <RoundedBox args={[3.25, 1.72, .12]} radius={.16} smoothness={4}><meshBasicMaterial color={hovered ? '#237b58' : '#1a2620'} /></RoundedBox>
                <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.27} color="#fffdf8" anchorX="center" position={[0,.31,.09]}>OPEN LIVE PROJECT ↗</Text>
                <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.115} color="#dbe9df" anchorX="center" maxWidth={2.7} position={[0,-.3,.09]}>navi-mumbai-house-price-prediction.vercel.app</Text>
            </group>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.15} color="#8d8173" anchorX="right" position={[3.9,-2.04,.13]}>LIVE PROJECT 01 / 01</Text>
        </group>
    );
};

export default LiveProjectsRoom;
