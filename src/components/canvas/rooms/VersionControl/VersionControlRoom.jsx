import { useEffect } from 'react';
import { RoundedBox } from '@react-three/drei';
import BuildLogTimeline from '../Studio/BuildLogTimeline';

const VersionControlRoom = ({ showRoom, onReady }) => {
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);

    return <group position={[0, .25, -8.2]}>
        <mesh position={[0, -2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[16, 14]} /><meshBasicMaterial color="#17130f" />
        </mesh>
        <RoundedBox args={[14.9, 7.95, .18]} radius={.22} smoothness={5} position={[0, .45, -2.7]}>
            <meshBasicMaterial color="#34271e" />
        </RoundedBox>
        <RoundedBox args={[14.35, 7.4, .1]} radius={.16} smoothness={4} position={[0, .45, -2.57]}>
            <meshBasicMaterial color="#ede2cc" />
        </RoundedBox>
        <BuildLogTimeline position={[0, 3.15, -2.4]} />
        <pointLight position={[0, 2, 1]} color="#f3c774" intensity={15} distance={10} />
    </group>;
};

export default VersionControlRoom;
