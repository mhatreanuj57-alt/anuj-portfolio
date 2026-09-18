import { useEffect, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';

const MODES = {
    recruiter: { label: 'RECRUITER', color: '#2a7654', lines: ['THE SHORTLIST', 'AI & ML student • creative developer'], details: ['Download the CV from the top-right document icon.', 'See live work: House Price Prediction and Carousel Lab.', 'Read the Studio Build Log for real progress and skills.'] },
    client: { label: 'CLIENT', color: '#b5543e', lines: ['THE DELIVERY', 'Interactive websites • AI tools • dashboards'], details: ['Browse live projects to see working product proof.', 'Explore the Carousel Lab for AI-assisted social design.', 'Use Contact to discuss an idea, dashboard, or web build.'] },
    collaborator: { label: 'COLLABORATOR', color: '#4d6897', lines: ['THE LAB', 'React • Three.js • Python • AI/ML'], details: ['Start in Studio for build notes and experiments.', 'Explore the 3D systems, interaction design, and AI tools.', 'Bring an idea worth prototyping together.'] },
    curious: { label: 'CURIOUS HUMAN', color: '#8a5e92', lines: ['THE SECRET PATH', 'Small details. Strange ideas. Real work.'], details: ['The corridor hides small interactions for explorers.', 'Try the gold sparkle near the main avatar.', 'Every room has a different way to tell the story.'] },
};

const ModeCard = ({ id, position, active, onSelect }) => {
    const [hovered, setHovered] = useState(false);
    const mode = MODES[id];
    const highlighted = active === id || hovered;
    return <group position={position} onClick={() => onSelect(id)} onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}>
        <RoundedBox args={[2.2, .82, .1]} radius={.12} smoothness={4}><meshBasicMaterial color={highlighted ? mode.color : '#f7f0e5'} /></RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.21} color={highlighted ? '#fffdf8' : '#201b17'} anchorX="center" anchorY="middle" position={[0, 0, .07]}>{mode.label}</Text>
    </group>;
};

const PortfolioIntelligenceRoom = ({ showRoom, onReady }) => {
    const [active, setActive] = useState('recruiter');
    const mode = MODES[active];
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);

    return <group position={[0, .45, -8.8]}>
        <RoundedBox args={[11.3, 6.4, .14]} radius={.25} smoothness={5} position={[.16, -.13, -.08]}><meshBasicMaterial color="#aa9a84" /></RoundedBox>
        <RoundedBox args={[11.3, 6.4, .16]} radius={.25} smoothness={5}><meshBasicMaterial color="#fffdf8" /></RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.72} color="#171411" anchorX="center" position={[0, 2.32, .13]}>PORTFOLIO INTELLIGENCE</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.23} color="#665b50" anchorX="center" position={[0, 1.7, .13]}>WHAT ARE YOU HERE FOR?</Text>
        <ModeCard id="recruiter" position={[-3.55, .72, .14]} active={active} onSelect={setActive} />
        <ModeCard id="client" position={[-1.15, .72, .14]} active={active} onSelect={setActive} />
        <ModeCard id="collaborator" position={[1.25, .72, .14]} active={active} onSelect={setActive} />
        <ModeCard id="curious" position={[3.65, .72, .14]} active={active} onSelect={setActive} />
        <RoundedBox args={[9.3, 2.7, .08]} radius={.18} smoothness={4} position={[0, -1.2, .12]}><meshBasicMaterial color="#f1eee6" /></RoundedBox>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.38} color={mode.color} anchorX="center" position={[0, -.35, .18]}>{mode.lines[0]}</Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.23} color="#211d18" anchorX="center" maxWidth={7.8} textAlign="center" position={[0, -.82, .18]}>{mode.lines[1]}</Text>
        {mode.details.map((detail, index) => <Text key={detail} font="/fonts/CabinSketch-Bold.ttf" fontSize={.16} color="#675e55" anchorX="center" maxWidth={8.25} textAlign="center" position={[0, -1.36 - index * .43, .18]}>• {detail}</Text>)}
    </group>;
};

export default PortfolioIntelligenceRoom;
