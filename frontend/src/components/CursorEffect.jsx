import React, { useEffect, useState, useRef } from 'react';

const CursorEffect = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            const { clientX, clientY } = e;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
            }

            if (followerRef.current) {
                followerRef.current.style.left = `${clientX}px`;
                followerRef.current.style.top = `${clientY}px`;
            }
        };

        const onMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                window.getComputedStyle(target).cursor === 'pointer';

            if (isClickable) {
                setIsHovering(true);
            }
        };

        const onMouseOut = (e) => {
            const target = e.target;
            const isClickable = target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button');

            if (isClickable) {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return (
        <>
            {/* Native Cursor Dot - Cyan/Core color */}
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-200 rounded-full pointer-events-none z-[9999] mix-blend-screen transition-transform duration-75 ease-out ${isHovering ? 'scale-0' : 'scale-100'}`}
                style={{ top: 0, left: 0, boxShadow: '0 0 4px #22d3ee' }}
            />

            {/* Arc Reactor Follower */}
            <div
                ref={followerRef}
                className={`fixed top-0 left-0 z-[9998] pointer-events-none transition-all duration-300 ease-out flex items-center justify-center`}
                style={{
                    width: isHovering ? '50px' : '32px',
                    height: isHovering ? '50px' : '32px',
                    transform: 'translate(-50%, -50%)',
                    top: 0,
                    left: 0,
                    filter: isHovering ? 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.6))' : 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.3))'
                }}
            >
                <svg
                    viewBox="0 0 100 100"
                    className={`w-full h-full overflow-visible transition-transform duration-300 ${isHovering ? 'scale-110' : 'scale-100'}`}
                >
                    <defs>
                        <linearGradient id="arcCore" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a5f3fc" />
                            <stop offset="50%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer Housing (Metal) */}
                    <path
                        d="M20 20 L80 20 L50 85 Z"
                        fill="#e2e8f0"
                        stroke="#94a3b8"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />

                    {/* Inner Dark Background */}
                    <path
                        d="M26 24 L74 24 L50 78 Z"
                        fill="#0f172a"
                    />

                    {/* Glowing Core Segments */}
                    <g fill="url(#arcCore)" className={isHovering ? "animate-pulse" : ""}>
                        {/* Top Segment */}
                        <path d="M36 28 L64 28 L50 38 Z" opacity="0.9" />

                        {/* Right Segment */}
                        <path d="M68 28 L72 26 L52 70 L52 42 Z" opacity="0.9" />

                        {/* Left Segment */}
                        <path d="M32 28 L28 26 L48 70 L48 42 Z" opacity="0.9" />
                    </g>

                    {/* Center Core Light */}
                    <circle cx="50" cy="45" r="5" fill="#fff" filter="url(#glow)" opacity="0.9" />

                    {/* Metallic Detail Lines */}
                    <path d="M20 20 L26 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    <path d="M80 20 L74 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    <path d="M50 85 L50 78" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
        </>
    );
};

export default CursorEffect;
