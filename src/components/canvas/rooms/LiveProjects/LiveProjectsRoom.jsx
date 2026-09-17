import { useEffect, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';

const PROJECT_URL = 'https://navi-mumbai-house-price-prediction-26wdhvjsm.vercel.app';

const BrandBadge = ({ position, title, subtitle, accent }) => (
    <group position={position}>
        <RoundedBox args={[2.35, 1.05, 0.08]} radius={0.12} smoothness={4}>
            <meshBasicMaterial color="#f7f1e6" />
        </RoundedBox>
        <RoundedBox args={[0.16, 0.72, 0.1]} radius={0.04} smoothness={3} position={[-0.92, 0, 0.07]}>
            <meshBasicMaterial color={accent} />
        </RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.27} color="#191613" anchorX="left" anchorY="middle" position={[-0.64, 0.17, 0.07]}>
            {title}
        </Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.13} color="#62594f" anchorX="left" anchorY="middle" position={[-0.64, -0.2, 0.07]}>
            {subtitle}
        </Text>
    </group>
);

const TechChip = ({ position, children }) => (
    <group position={position}>
        <RoundedBox args={[1.36, 0.46, 0.06]} radius={0.09} smoothness={3}>
            <meshBasicMaterial color="#e8eee9" />
        </RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.16} color="#244a37" anchorX="center" anchorY="middle" position={[0, 0, 0.05]}>
            {children}
        </Text>
    </group>
);

const LiveProjectsRoom = ({ showRoom, onReady }) => {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (showRoom) onReady?.();
    }, [showRoom, onReady]);

    const openProject = () => window.open(PROJECT_URL, '_blank', 'noopener,noreferrer');

    return (
        <group position={[0, 0.55, -8.4]} scale={0.94}>
            <RoundedBox args={[9.2, 5.75, 0.14]} radius={0.22} smoothness={5} position={[0.14, -0.12, -0.08]}>
                <meshBasicMaterial color="#b6a894" />
            </RoundedBox>
            <RoundedBox args={[9.2, 5.75, 0.16]} radius={0.22} smoothness={5}>
                <meshBasicMaterial color="#fffdf8" />
            </RoundedBox>

            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.5} color="#171411" anchorX="left" anchorY="middle" position={[-3.95, 2.05, 0.13]} maxWidth={7.9}>
                HOUSE PRICE PREDICTION
            </Text>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.18} color="#695e52" anchorX="left" anchorY="middle" position={[-3.95, 1.58, 0.13]}>
                NAVI MUMBAI + BMC PROPERTY INTELLIGENCE
            </Text>

            <BrandBadge position={[-2.68, 0.53, 0.13]} title="NAVI MUMBAI" subtitle="CITY DATA" accent="#1d7a58" />
            <BrandBadge position={[-0.06, 0.53, 0.13]} title="BMC" subtitle="MUMBAI REGION" accent="#be4a36" />

            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.24} color="#1d1a16" anchorX="left" anchorY="top" position={[-3.95, -0.35, 0.13]} maxWidth={4.7} lineHeight={1.35}>
                Predict property values using locality, BHK, area and market data.
            </Text>
            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.17} color="#5d554b" anchorX="left" anchorY="top" position={[-3.95, -1.24, 0.13]} maxWidth={4.7} lineHeight={1.35}>
                Explore diagnostic charts and comparable listings in a live web app.
            </Text>

            <TechChip position={[-3.28, -2.1, 0.13]}>PYTHON</TechChip>
            <TechChip position={[-1.72, -2.1, 0.13]}>ML MODEL</TechChip>
            <TechChip position={[-0.16, -2.1, 0.13]}>VERCEL</TechChip>

            <group
                position={[2.35, -0.4, 0.14]}
                onClick={openProject}
                onPointerOver={() => {
                    setIsHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setIsHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            >
                <RoundedBox args={[3.35, 1.82, 0.12]} radius={0.16} smoothness={4}>
                    <meshBasicMaterial color={isHovered ? '#237b58' : '#1a2620'} />
                </RoundedBox>
                <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.25} color="#fffdf8" anchorX="center" anchorY="middle" position={[0, 0.37, 0.09]}>
                    OPEN LIVE PROJECT ↗
                </Text>
                <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.115} color="#dbe9df" anchorX="center" anchorY="middle" position={[0, -0.29, 0.09]} maxWidth={2.85}>
                    navi-mumbai-house-price-prediction.vercel.app
                </Text>
            </group>

            <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.15} color="#8d8173" anchorX="right" anchorY="middle" position={[3.95, -2.12, 0.13]}>
                LIVE PROJECT 01 / 01
            </Text>
        </group>
    );
};

export default LiveProjectsRoom;
