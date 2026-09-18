import { Text } from '@react-three/drei';

const ENTRIES = [
    ['2025', 'STARTED B.TECH', 'CSE (AI & ML)'],
    ['2025', 'FIRST ML BUILD', 'House price prediction'],
    ['2026', 'SHIPPED 3D PORTFOLIO', 'React + Three.js'],
    ['2026', 'BUILT CAROUSEL LAB', 'AI social creator'],
    ['NEXT', 'PROJECT CITY', 'One home per build'],
];

const BuildLogTimeline = () => (
    <group position={[0, 5.9, -15]}>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.6} color="#171411" anchorX="center">
            BUILD LOG
        </Text>
        <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={0.2} color="#5b5146" anchorX="center" position={[0, -0.45, 0]}>
            SMALL STEPS. REAL SHIPS.
        </Text>
        <mesh position={[0, -2.25, -0.06]}>
            <planeGeometry args={[12.3, 4.1]} />
            <meshBasicMaterial color="#f7f0df" />
        </mesh>
        <mesh position={[0, -2.25, 0]}>
            <planeGeometry args={[10.6, 0.06]} />
            <meshBasicMaterial color="#8d7861" />
        </mesh>
        {ENTRIES.map(([date, title, detail], index) => {
            const x = -4.2 + index * 2.1;
            const y = index % 2 === 0 ? -1.85 : -2.35;
            return (
                <group key={title} position={[x, y, 0.03]} rotation={[0, 0, (index - 2) * 0.035]}>
                    <mesh><planeGeometry args={[1.75, 1.45]} /><meshBasicMaterial color={index === 4 ? '#dcebdc' : '#fffdf7'} /></mesh>
                    <mesh position={[0, .61, .04]}><circleGeometry args={[.07, 12]} /><meshBasicMaterial color={index === 4 ? '#3d8558' : '#bd4938'} /></mesh>
                    <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.2} color="#9a4438" anchorX="center" position={[0, .33, .04]}>{date}</Text>
                    <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.22} color="#1e1a16" anchorX="center" maxWidth={1.42} textAlign="center" position={[0, -.08, .04]}>{title}</Text>
                    <Text font="/fonts/CabinSketch-Bold.ttf" fontSize={.15} color="#62574c" anchorX="center" maxWidth={1.36} textAlign="center" position={[0, -.53, .04]}>{detail}</Text>
                </group>
            );
        })}
    </group>
);

export default BuildLogTimeline;
